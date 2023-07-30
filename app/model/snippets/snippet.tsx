import Yaml from 'js-yaml';
import * as luxon from 'luxon';
import { SnippetRoute, SnippetWithPreviewRoute } from '../../routes/snippets/one/snippet';
import { loadContentFile, saveContentFile } from '../../util/data-files';
import { markdown } from '../../util/helpers';
import { pushChanges } from '../../util/live-editing';
import { Book } from '../books/book';
import { snippetEvents } from '../events';
import { allBooks, allSnippets } from '../models';
import snippetsDir from './data/';
import { Tag } from './tag';

export class Snippet {
  static from(file: FsFile) {
    const data = loadContentFile<{
      published: boolean,
      title: string,
      archiveSlug: string,
      archivePage: string,
      bookSlug: string,
      tags: string[],
    }>(file, 'date-slug');

    return new Snippet(
      file,
      data.date,
      data.slug,
      data.markdownContent,
      data.meta.published,
      data.meta.title,
      data.meta.archiveSlug,
      data.meta.archivePage,
      data.meta.bookSlug,
      new Set(data.meta.tags ?? []),
    );
  }

  nextSnippet?: Snippet;
  prevSnippet?: Snippet;

  view;
  viewWithPreview;

  tags;

  public renderedBody;
  public renderedTitle;

  public previewMarkdown;
  constructor(
    private file: FsFile,
    public date: string,
    public slug: string,
    public markdownContent: string,
    public published: boolean,
    public title: string,
    public archiveSlug: string,
    public archivePage: string,
    public bookSlug: string,
    tags: Set<string>,
  ) {
    this.previewMarkdown = this.derivePreview(2000);

    this.view = new SnippetRoute(this);
    this.viewWithPreview = new SnippetWithPreviewRoute(this);

    this.book = allBooks.find(book => book.slug.includes(this.bookSlug))!;
    this.book.snippets.push(this);

    this.tags = new Set([...tags].map(Tag.getOrCreate));
    for (const tag of this.tags) {
      tag.addSnippet(this);
    }

    allSnippets?.unshift(this);

    this.renderedBody = markdown.render(this.markdownContent);
    this.renderedTitle = markdown.renderInline(this.title);
  }

  get archiveLink() {
    return `https://archive.org/details/${this.archiveSlug}/page/${this.archivePage}?view=theater`;
  }

  private derivePreview(count: number) {
    const paragraphs = this.markdownContent.trim().split(/(\r?\n>+ *\r?\n)/);

    let running = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      running += paragraphs[i]!.length;
      if (running > count) break;
    }

    if (running < this.markdownContent.trim().length - 1) {
      return this.markdownContent.substring(0, running);
    }
    return null;
  }

  setTags(tags: string[]) {
    for (const tag of this.tags) {
      tag.removeSnippet(this);
    }
    this.tags = new Set(tags.map(Tag.getOrCreate));
    for (const tag of this.tags) {
      tag.addSnippet(this);
    }

    this.save();

    setTimeout(() => {
      pushChanges(this.file.realPath, 'Updated snippet from site');
    }, 100);
  }

  save() {
    saveContentFile(this.file, {
      published: this.published,
      title: this.title,
      archiveSlug: this.archiveSlug,
      archivePage: this.archivePage,
      bookSlug: this.bookSlug,
      tags: [...this.tags].map(tag => tag.name),
    }, this.markdownContent);
  }

  book: Book;

  get image() {
    return this.book.category.imageBig;
  }

  static create(newData: {
    archiveSlug: string,
    archivePage: string,
    slug: string,
    bookSlug: string,
    title: string,
    markdownContent: string,
  }): Snippet {
    const date = luxon.DateTime.now().toISODate();
    const header = Yaml.dump({
      published: true,
      title: newData.title,
      archiveSlug: newData.archiveSlug,
      archivePage: newData.archivePage,
      bookSlug: newData.bookSlug,
    });
    const buffer = Buffer.from(`---\n${header}---\n\n${newData.markdownContent}`);
    const file = snippetsDir.createFile(`${date}-${newData.slug}.md`, buffer);
    const newSnippet = Snippet.from(file);
    newSnippet.save();
    newSnippet.book.sortAndConnectBookSnippets();
    snippetEvents.emit('created', newSnippet);

    setTimeout(() => {
      pushChanges(file.realPath, 'New snippet from site');
    }, 100);

    return newSnippet;
  }

  update(newData: {
    archivePage: string,
    archiveSlug: string,
    bookSlug: string,
    title: string,
    markdownContent: string,
  }) {
    this.archivePage = newData.archivePage;
    this.archiveSlug = newData.archiveSlug;
    this.bookSlug = newData.bookSlug;
    this.title = newData.title;
    this.markdownContent = newData.markdownContent.replace(/\r\n/g, '\n');

    this.save();
    this.book.sortAndConnectBookSnippets();
    snippetEvents.emit('updated', this);

    setTimeout(() => {
      pushChanges(this.file.realPath, 'Updated snippet from site');
    }, 100);
  }

}
