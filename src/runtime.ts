import * as fs from "fs";
import * as path from "path/posix";
import * as sucrase from 'sucrase';
import * as vm from 'vm';

class FsFile {

  constructor(
    public path: string,
    public content: Buffer,
    public needsModule: boolean,
  ) { }

}

export class Runtime {

  files = new Map<string, FsFile>();
  modules = new Map<string, vm.Module>();

  constructor(private realBase: string) {
    this.#loadDir('/');
  }

  #loadDir(base: string) {
    const dirRealPath = path.join(this.realBase, base);
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
    const finalFilePath = filepath.replace(/\.tsx?$/, '.js');
    const isTS = finalFilePath !== filepath;

    const realFilePath = path.join(this.realBase, filepath);
    let content = fs.readFileSync(realFilePath);

    if (isTS) {
      const rawCode = content.toString('utf8');
      const transformed = sucrase.transform(rawCode, {
        transforms: ['typescript', 'jsx'],
        jsxRuntime: 'automatic',
        jsxImportSource: '/core',
        disableESTransforms: true,
        production: true,
      });

      content = Buffer.from(transformed.code
        .replace(/"\/core\/jsx-runtime"/g, `"/core/jsx-runtime.js"`)
      );
    }

    const file = new FsFile(finalFilePath, content, isTS);
    this.files.set(file.path, file);
  }

  realPath(filepath: string) {
    return path.join(this.realBase, filepath);
  }

  async reflectChangesFromReal(filepaths: string[]) {
    for (const filepath of filepaths) {
      const realFilePath = path.join(this.realBase, filepath);

      if (fs.existsSync(realFilePath)) {
        this.#createFile(filepath);
      }
      else {
        this.files.delete(filepath);
      }
    }

    await this.createModules();
  }

  async createModules() {
    const packages = new Map<string, Promise<vm.Module>>();

    const linker = async (specifier: string, referencingModule: vm.Module) => {
      if (!specifier.match(/^[./]/)) {
        let pkg = packages.get(specifier);
        if (!pkg) packages.set(specifier, pkg = new Promise(async (resolve) => {
          const result = await import(specifier);
          resolve(new vm.SyntheticModule(Object.keys(result), function () {
            for (const [key, val] of Object.entries(result)) {
              this.setExport(key, val);
            }
          }));
        }));
        return await pkg;
      }

      const absPath = path.resolve(path.dirname(referencingModule.identifier), specifier);

      const module = this.modules.get(absPath);
      if (module) {
        return module;
      }

      if (specifier.endsWith('/')) {
        const dirPath = absPath.endsWith('/') ? absPath : absPath + '/';
        const files = [...this.files.values()]
          .filter(file => file.path.startsWith((dirPath)));

        return new vm.SyntheticModule(['default'], function () {
          this.setExport('default', files);
        });
      }

      throw new Error(`Can't find file at path: ${specifier}`);
    };

    this.modules.clear();

    for (const file of this.files.values()) {
      if (file.needsModule) {
        const module = new vm.SourceTextModule(file.content.toString('utf8'), {
          identifier: file.path,
          importModuleDynamically: (async (specifier: string, referencingModule: vm.Module) => {
            const mod = await linker(specifier, referencingModule);
            await mod.link(linker);
            await mod.evaluate();
            return mod.namespace;
          }) as any,
        });

        this.modules.set(file.path, module);
      }
    }

    await this.modules.get('/core/main.js')!.link(linker);
  }

}
