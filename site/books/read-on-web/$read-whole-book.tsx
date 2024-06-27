import MarkdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@13.0.2/+esm';
import { mdOptions } from '../../components/$markdown.js';
import { SnippetJson } from "../../scripts/data/snippets.json.js";

const isDev = (window.location.hostname === 'localhost');

const markdown = MarkdownIt(mdOptions);

const bookSlug = document.querySelector<HTMLScriptElement>('script[data-book]')!.dataset['book']!;
const allSnippets = await fetch('/scripts/data/snippets.json').then<SnippetJson[]>(res => res.json());
const snippetSlugsInBook = await fetch(`/scripts/data/snippets/in-book-${bookSlug}.json`).then<string[]>(res => res.json());

const snippetsInBook = snippetSlugsInBook.map(slug => allSnippets.find(s => s.slug === slug)!);

const linksDiv = document.getElementById('readonline-chapters') as HTMLDivElement;
const bodiesDiv = document.getElementById('chapter-bodies') as HTMLDivElement;

linksDiv.replaceChildren(<>
  {snippetsInBook.map((bookSnippet, i) => <span class='chapter-link'>
    <span>Ch.{i + 1}</span>
    <a href={`#snippet-${bookSnippet.slug}`}>
      {bookSnippet.title}
    </a>
  </span>)}
</>);

bodiesDiv.replaceChildren(<>
  {snippetsInBook.map((bookSnippet, i) => <>
    <div class='chapter' id={`snippet-${bookSnippet.slug}`}>
      <h3 class='chapter-header'>
        Chapter {i + 1} &mdash; { }
        <a href={bookSnippet.route}>
          {bookSnippet.title}
        </a>
      </h3>
      <div innerHTML={markdown.render(bookSnippet.markdown)} />
      <hr />
    </div>
  </>)}
</>);

// const chapterLinks = [...document.querySelectorAll<HTMLSpanElement>('.chapter-link')];
// const chapterDivs = [...document.querySelectorAll<HTMLDivElement>('.chapter')];

// const chapters: {
//   div: HTMLDivElement,
//   link: HTMLSpanElement,
//   slug: string,
//   i: number,
// }[] = [];

// for (let i = 0; i < chapterDivs.length; i++) {
//   const div = chapterDivs[i]!;
//   const link = chapterLinks[i]!;
//   const slug = div.id.replace(/^snippet-/, '');
//   chapters.push({ div, link, slug, i });

//   const moveUp = <button>Move up</button> as HTMLButtonElement;
//   const moveDown = <button>Move down</button> as HTMLButtonElement;

//   moveUp.onclick = (e) => moveSnippet(div, -1);
//   moveDown.onclick = (e) => moveSnippet(div, 1);

//   const buttons = <div style='margin-left:1px'>{moveUp} {moveDown}</div> as HTMLDivElement;
//   div.querySelector('h3')!.insertAdjacentElement('afterend', buttons);
// }

// function saveOrder() {
//   const json = chapters.map(c => ({ slug: c.slug, i: c.i }));
//   fetch('/reorder-snippets-in-book', {
//     method: 'POST',
//     body: JSON.stringify(json),
//   });
// }

// function moveSnippet(div: HTMLDivElement, by: number) {
//   const i = [...div.parentElement!.children].indexOf(div);
//   const c = chapters[i]!;

//   if (by === -1) {
//     c.div.previousElementSibling!.insertAdjacentElement('beforebegin', c.div);
//     c.link.previousElementSibling!.insertAdjacentElement('beforebegin', c.link);
//   }
//   else {
//     c.div.nextElementSibling!.insertAdjacentElement('afterend', c.div);
//     c.link.nextElementSibling!.insertAdjacentElement('afterend', c.link);
//   }

//   chapters.splice(i, 1);
//   chapters.splice(i + by, 0, c);

//   for (let i = 0; i < chapters.length; i++) chapters[i]!.i = i;

//   window.location.hash = '#';
//   window.location.hash = '#' + div.id;

//   saveOrder();
// }
