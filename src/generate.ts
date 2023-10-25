import * as fs from 'fs';
import * as path from 'path/posix';
import { Site } from './site.js';

const site = new Site("site");
await site.setup();

const out = (await site.build())!.outfiles;

const madeDirs = new Set<string>();
const mkdirIfNeeded = (dir: string) => {
  if (madeDirs.has(dir)) return;
  madeDirs.add(dir);
  console.log('mkdir', dir);
  fs.mkdirSync(dir);
};

for (const [filepath, content] of out) {
  const newFilepath = path.join('docs', filepath);
  const parts = newFilepath.split(path.sep);
  for (let i = 1; i < parts.length; i++) {
    const dir = path.join(...parts.slice(0, i));
    mkdirIfNeeded(dir);
  }

  console.log('writefile', newFilepath)
  fs.writeFileSync(newFilepath, content);
}
