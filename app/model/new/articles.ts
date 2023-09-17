import { loadContentFile } from '../../util/data-files';

export interface Article {
  date: string;
  slug: string;
  content: string;

  title: string;
  draft?: boolean;
}

export function articleFromFile(file: FsFile) {
  const data = loadContentFile<Article>(file);
  return data;
}
