import fs from "fs";
import path from "path/posix";

class FsNode {

  constructor(
    public realBase: string,
    public name: string,
    public parent: FsDir | null,
  ) { }

  get path() {
    const parts: string[] = [];
    for (let node: FsNode | FsDir | null = this; node; node = node.parent) {
      parts.unshift(node.name);
    }
    return path.join('/', ...parts);
  }

  get realPath() {
    return path.join(this.realBase, this.path);
  }

  // rename(newName: string) {
  //   if (this.parent?.childrenByName[newName]) {
  //     throw new Error("Cannot overwrite existing file.");
  //   }

  //   const oldPath = this.realPath;
  //   this.name = newName;
  //   const newPath = this.realPath;
  //   fs.renameSync(oldPath, newPath);
  // }

  isFile(): this is FsFile { return this instanceof FsFile };
  isDir(): this is FsDir { return this instanceof FsDir };

}

function isFile(child: FsNode): child is FsFile { return child.isFile(); };
function isDir(child: FsNode): child is FsDir { return child.isDir(); };

export class FsDir extends FsNode {

  children: (FsFile | FsDir)[] = [];

  get root(): FsDir {
    let ancestor: FsDir = this;
    while (ancestor.parent) ancestor = ancestor.parent;
    return ancestor;
  }

  get files(): FsFile[] { return this.children.filter(isFile); }
  get dirs(): FsDir[] { return this.children.filter(isDir); }

  get childrenByName() { return Object.fromEntries(this.children.map(c => [c.name, c])); }
  get filesByName() { return Object.fromEntries(this.files.map(c => [c.name, c])); }
  get dirsByName() { return Object.fromEntries(this.dirs.map(c => [c.name, c])); }

  // createFile(name: string, buffer: Buffer) {
  //   if (this.childrenByName[name]) {
  //     throw new Error("Cannot overwrite existing file.");
  //   }

  //   const child = new FsFile(this.realBase, name, this);
  //   child.buffer = buffer;
  //   fs.writeFileSync(child.realPath, buffer);
  //   this.children.push(child);

  //   return child;
  // }

  find(toPath: string) {
    const absolutePath = (toPath.startsWith('/')
      ? toPath
      : path.join(this.path, toPath));

    let dir: FsDir = this.root;
    const parts = absolutePath.split(path.sep).slice(1);
    let part: string | undefined;

    while (undefined !== (part = parts.shift())) {
      if (parts.length === 0) {
        if (part === '') return dir;

        return (
          dir.filesByName[part] ??
          dir.filesByName[part + '.ts'] ??
          dir.filesByName[part + '.tsx'] ??
          dir.dirsByName[part]?.filesByName['index.ts'] ??
          dir.dirsByName[part]?.filesByName['index.tsx'] ??
          null
        );
      }
      else {
        const subdir = dir.dirsByName[part];
        if (!subdir) break;
        dir = subdir;
      }
    }

    return null;
  }

}

export class FsFile extends FsNode {

  declare parent: FsDir;
  buffer!: Buffer;

  // replace(newBuffer: Buffer) {
  //   this.buffer = newBuffer;
  //   fs.writeFileSync(this.realPath, newBuffer);
  // }

  get root(): FsDir {
    return this.parent.root;
  }

  get text() {
    return this.buffer.toString('utf8');
  }

}

export class FileSys {

  root;

  constructor(public fsBase: string) {
    this.root = this.#loadDir('/', null);
  }

  #loadDir(base: string, parent: FsDir | null) {
    const dir = new FsDir(this.fsBase, path.basename(base), parent);

    const dirRealPath = path.join(this.fsBase, base);
    const files = fs.readdirSync(dirRealPath);
    for (const name of files) {
      if (name.startsWith('.')) continue;

      const fileRealPath = path.join(this.fsBase, base, name);
      const stat = fs.statSync(fileRealPath);

      if (stat.isDirectory()) {
        const child = this.#loadDir(path.join(base, name), dir);
        dir.children.push(child);
      }
      else if (stat.isFile()) {
        const child = new FsFile(this.fsBase, name, dir);
        child.buffer = fs.readFileSync(child.realPath);
        dir.children.push(child);
      }
    }

    return dir;
  }

  update(paths: Set<string>) {
    this.root = this.#loadDir('/', null);
  }

}
