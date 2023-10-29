import * as fs from "fs";
import * as path from "path/posix";
import * as sucrase from 'sucrase';
import { pathToFileURL } from "url";
import * as vm from 'vm';

export class Runtime {

  files = new Map<string, File>();
  #deps = new Map<string, Set<string>>();

  constructor(private realBase: string) {
    this.#loadDir('/');
  }

  build() {
    console.time('Running /core/main.js');
    try {
      const mainModule = this.files.get('/core/main.js')!.module!;
      return mainModule.require() as {
        outfiles: Map<string, Buffer | string>,
        handlers: Map<string, (body: string) => string>,
      };
    }
    catch (e) {
      console.error(e);
      return;
    }
    finally {
      console.timeEnd('Running /core/main.js');
    }
  }

  async pathsUpdated(...paths: string[]) {
    const filepaths = paths.map(p => p.slice(this.realBase.length));

    for (const filepath of filepaths) {
      const realFilePath = this.realPathFor(filepath);

      if (fs.existsSync(realFilePath)) {
        this.#createFile(filepath);
      }
      else {
        this.files.delete(filepath);
      }
    }

    const resetSeen = new Set<string>();
    for (const filepath of filepaths) {
      this.#resetDepTree(filepath, resetSeen);
    }
  }

  #loadDir(base: string) {
    const dirRealPath = this.realPathFor(base);
    const files = fs.readdirSync(dirRealPath);
    for (const name of files) {
      if (name.startsWith('.')) continue;

      const realFilePath = path.join(dirRealPath, name);
      const stat = fs.statSync(realFilePath);

      if (stat.isDirectory()) {
        this.#loadDir(path.join(base, name));
      }
      else if (stat.isFile()) {
        const filepath = path.join(base, name);
        this.#createFile(filepath);
      }
    }
  }

  #createFile(filepath: string) {
    const realFilePath = this.realPathFor(filepath);
    let content = fs.readFileSync(realFilePath);
    const file = new File(filepath, content, this);
    this.files.set(file.path, file);
  }

  requireFromModule(toPath: string, fromPath: string) {
    if (!toPath.match(/^[./]/)) {
      return require(toPath);
    }

    const absPath = path.resolve(path.dirname(fromPath), toPath);

    const module = this.files.get(absPath)?.module;
    if (module) {
      this.addDeps(fromPath, module.filepath);
      return module.require();
    }

    if (toPath.endsWith('/')) {
      const dirPath = absPath.endsWith('/') ? absPath : absPath + '/';
      this.addDeps(fromPath, dirPath);
      const files = [...this.files.values()]
        .filter(file => file.path.startsWith((dirPath)));
      return files;
    }

    throw new Error(`Can't find file at path: ${toPath}`);
  }

  realPathFor(filepath: string) {
    return path.join(this.realBase, filepath);
  }

  addDeps(requiredBy: string, requiring: string) {
    let list = this.#deps.get(requiring);
    if (!list) this.#deps.set(requiring, list = new Set());
    list.add(requiredBy);
  }

  #resetDepTree(path: string, seen: Set<string>) {
    if (seen.has(path)) return;
    seen.add(path);

    for (const [requiring, requiredBy] of this.#deps) {
      if (path.startsWith(requiring)) {
        this.#deps.delete(requiring);
        for (const dep of requiredBy) {
          const module = this.files.get(convertTsExts(dep))?.module;
          module?.resetExports();
          this.#resetDepTree(dep, seen);
        }
      }
    }
  }

}

class File {

  module?: Module;

  constructor(
    public path: string,
    public content: Buffer | string,
    runtime: Runtime,
  ) {
    if (path.match(/\.tsx?$/)) {
      const code = content.toString('utf8');
      this.module = new Module(code, this.path, runtime);
      this.content = compileTSX(code).code;
      this.path = convertTsExts(path);
    }
  }

}

class Module {

  #fn: (() => void) | undefined;
  #exports: object | undefined;

  constructor(
    private content: string,
    public filepath: string,
    private runtime: Runtime,
  ) { }

  require(): any {
    if (!this.#exports) {
      this.#exports = Object.create(null);
      this.#run();
    }
    return this.#exports;
  }

  #run() {
    if (!this.#fn) {
      const realFilePath = this.runtime.realPathFor(this.filepath);
      const transformed = compileTSX(this.content, realFilePath);
      const sourceCode = transformed.code;
      const sourceMapBase64 = Buffer.from(JSON.stringify(transformed.sourceMap)).toString('base64url');
      const sourceMap = `\n//# sourceMappingURL=data:application/json;base64,${sourceMapBase64}`;

      this.content = sourceCode + sourceMap;

      const fn = vm.compileFunction(sourceCode + sourceMap, ['require', 'exports'], {
        filename: pathToFileURL(realFilePath).href,
      });

      const require = (toPath: string) => this.runtime.requireFromModule(toPath, this.filepath);
      this.#fn = () => fn(require, this.#exports);
    }
    this.#fn();
  }

  resetExports() {
    this.#exports = undefined;
  }

}

function compileTSX(code: string, realFilePath?: string) {
  const options: sucrase.Options = {
    transforms: ['typescript', 'jsx'],
    jsxRuntime: 'automatic',
    jsxImportSource: '/core',
    disableESTransforms: true,
    production: true,
  };
  if (realFilePath) {
    options.transforms.push('imports');
    options.sourceMapOptions = { compiledFilename: realFilePath };
    options.filePath = pathToFileURL(realFilePath).href;
  }
  const result = sucrase.transform(code, options);
  result.code = result.code.replace(/"\/core\/jsx-runtime"/g, `"/core/jsx-transform.js"`)
  return result;
}

function convertTsExts(path: string) {
  return path.replace(/\.tsx?$/, '.js');
}
