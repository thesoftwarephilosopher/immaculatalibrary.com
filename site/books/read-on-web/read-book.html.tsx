import { Column, Spaced } from "../../components/column/column";
import { TypicalPage } from "../../components/page";
import { Rating } from "../../components/rating";
import { Typography } from "../../components/typography";
import { markdown } from "../../core/helpers";
import { allBooks } from '../../model/books';

export default allBooks.map(book => {
  const orderedSnippets = [...book.snippets];

  return [`${book.slug}.html`, <>
    <TypicalPage title="Books" image={book.category.imageBig}>

      <Spaced>
        <Column split>

          <Typography>

            <link rel="stylesheet" href='/css/book.css' />

            <h2>{book.data.title}</h2>
            <p class="subtitle">{book.data.subtitle}</p>
            <p>By <span class="author">{book.data.author}</span></p>
            <p><Rating n={book.data.rating} /></p>
            {markdown.render(book.content)}

            <hr />

            {orderedSnippets.map((bookSnippet, i) => <>
              <div class='chapter' id={`snippet-${bookSnippet.slug}`}>
                <h3 class='chapter-header'>
                  Chapter {i + 1} &mdash; { }
                  <a href={bookSnippet.route}>
                    {bookSnippet.renderedTitle}
                  </a>
                </h3>
                {bookSnippet.renderedBody}
                <hr />
              </div>
            </>)}

          </Typography>

          <div>

            <ul class="readonline-chapters">
              <h3>Chapter Index</h3>

              {orderedSnippets.map((bookSnippet, i) => <>
                <li>
                  <p>
                    Ch.{i + 1} { }
                    <a href={`#snippet-${bookSnippet.slug}`}>
                      {bookSnippet.renderedTitle}
                    </a>
                  </p>
                </li>
              </>)}
            </ul>

          </div>

        </Column>
      </Spaced>

    </TypicalPage>
  </>];
});
