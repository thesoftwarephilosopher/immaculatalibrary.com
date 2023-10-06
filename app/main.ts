import path from 'path/posix';
import * as routes from './routes';
import files from './site/';
import { isDev } from './core/helpers';

routes.out.clear();

console.time('Building views');

const sitemapIdx = files.findIndex(([filepath, content]) => filepath === '/site/sitemap.xml.tsx');
const sitemap = files[sitemapIdx]!;
files.splice(sitemapIdx, 1);
files.push(sitemap);

for (const [filepath, contents] of files) {
  const outpath = filepath.slice('/site'.length);

  if (!isDev && outpath.startsWith('/admin/')) contents;

  if (filepath.endsWith('.tsx')) {
    const dir = path.dirname(outpath);
    const exported = require(filepath).default;

    if (Array.isArray(exported)) {
      for (const [name, jsx] of exported) {
        routes.out.set(path.join(dir, name), (jsx as JSX.Element).stringify());
      }
    }
    else {
      routes.out.set(outpath.slice(0, -4), (exported as JSX.Element).stringify());
    }
  }
  else {
    routes.out.set(outpath, contents);
  }
}

for (const [filepath, contents] of routes.resources) {
  routes.out.set(filepath, contents);
}

console.timeEnd('Building views');

export default routes.out;
