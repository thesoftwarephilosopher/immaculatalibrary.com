import { DataFile } from '../core/data-files.js';
import { sortBy } from '../core/helpers.js';
import allCategoryFiles from "../data/categories/";
import { Book } from './books.js';
import { categories } from './relations.js';

interface CategoryFile {
  title: string;
  shortTitle: string;
  books: string[];
  sortOrder: number;
}

export class Category extends DataFile<CategoryFile> {

  static override modelDir = 'categories';

  route: string;
  imageBig: string;
  imageSmall: string;

  constructor(slug: string, content: string, data: CategoryFile) {
    super(slug, content, data);
    this.route = `/books/category/${this.slug}.html`;
    this.imageBig = `/img/categories/${this.slug}-big.jpg`;
    this.imageSmall = `/img/categories/${this.slug}-small.jpg`;
  }

  get books(): Book[] {
    return categories().booksInCategory.get(this)!;
  }

}

export const allCategories = (allCategoryFiles
  .map(file => Category.fromFile(file))
  .sort(sortBy(c => c.data.sortOrder)));

export const categoriesBySlug = Object.fromEntries(allCategories.map(cat => [cat.slug, cat]));
