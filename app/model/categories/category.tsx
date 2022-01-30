import { ViewCategory } from '../../pages/category/view-category';
import { loadContentFile } from '../../util/data-files';
import { staticRouteFor } from '../../util/static';
import { Book } from '../books/book';

export class Category {

  static from(dir: FsDir) {
    const file = dir.filesByName['content.md']!;

    const data = loadContentFile<{
      title: string,
      shortTitle: string,
      books: string[],
    }>(file, 'slug');

    const imageBig = staticRouteFor(dir.filesByName['image-big.jpg']!);
    const imageSmall = staticRouteFor(dir.filesByName['image-small.jpg']!);

    return new Category(
      dir.name,
      data.markdownContent,
      data.meta.title,
      data.meta.shortTitle,
      imageBig,
      imageSmall,
      new Set(data.meta.books),
    );
  }

  view;

  books: Book[] = [];

  constructor(
    public slug: string,
    public markdownContent: string,
    public title: string,
    public shortTitle: string,
    public imageBig: string,
    public imageSmall: string,
    public bookSlugs: Set<string>,
  ) {
    this.view = new ViewCategory(this);
  }

}
