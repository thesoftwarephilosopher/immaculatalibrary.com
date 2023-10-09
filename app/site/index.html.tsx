import * as Common from "../components/common";
import { LatestBookSnippets } from "../components/latest-snippets";
import { EmptyPage } from "../components/page";
import { categoriesBySlug } from '../model/categories';
import { booksBySlug } from '../model/books';
import { sortedTags } from "../model/tag";

export default <>
  <EmptyPage>

    <link rel="stylesheet" href="/css/home.css" />

    <section id="home-hero" style={`background-image: url(/img/page/home.jpg)`}>
      <div></div>
      <div>
        <div>
          <h1><a href='/'>Immaculata Library</a></h1>
          <p>Catholic Digital Library</p>
        </div>
      </div>
    </section>

    <Common.Navlinks />

    <main>

      <Common.Column spaced centered>
        <div class="home">
          <Common.Typography>
            <h2>Letters from Heaven</h2>
            <blockquote>
              <p>
                “Have always at hand some approved book of devotion, and read a little of them every day with as much devotion as if you
                were reading a letter which those saints had sent you from heaven to show you the way to it, and encourage you to come.”
              </p>
              <ul>
                <li>
                  <p>&mdash; St. Francis de Sales</p>
                  <p>
                    <a href="/books/introduction-to-the-devout-life.html">Introduction to the Devout Life</a>, page{' '}
                    <a rel="noopener" href="/book-snippets/2021-06-26-how-we-should-do-holy-reading.html">77</a>
                  </p>
                </li>
              </ul>
            </blockquote>
          </Common.Typography>
        </div>
      </Common.Column>

      <div id='featured-books-area'>

        <div id='featured-books-container'>

          <h2>Featured books</h2>

          <ul id='featured-books'>
            {[
              'introduction-to-the-devout-life',
              'imitation-of-christ',
              'st-john-henry-newman-reply-to-eirenicon',
              'catena-aurea',
              'the-sinners-guide',
              'the-spiritual-combat',
              'the-glories-of-mary',
              'catholic-encyclopedia',
            ].map(id => {
              const book = booksBySlug[id]!;

              const imageUrl = categoriesBySlug[book.data.frontpage!.image]!.imageBig;
              return <>
                <li class='featured-book'>
                  <h3><a href={book.route}>{book.data.title}</a></h3>
                  <a href={book.route}>
                    <div class='thumb' style={`background-image: url(${imageUrl})`} />
                  </a>
                  <Common.Typography><p>{book.data.frontpage!.why}</p></Common.Typography>
                </li>
              </>;
            })}
          </ul>

        </div>

      </div>

      <Common.Column spaced split>

        <div>

          <div>
            <h3>Random Book Snippet (<a href='#' id='refresh-random-book-snippet'>Another</a>)</h3>
            <Common.Typography>
              <div id="random-book-snippet">
                <p><em>Loading...</em></p>
              </div>
            </Common.Typography>
          </div>
          <script type='module' src='/script/random-book-snippet.js' defer />

          {/* <h3>Book Snippets by Tag</h3>
          <p>{sortedTags().map(tag => <>
            <a href={tag.route}>#{tag.oneword}</a> { }
          </>)}</p> */}
        </div>
        <div>

          <LatestBookSnippets />

        </div>

      </Common.Column>

    </main>

    <Common.QuickLinks />
    <Common.SiteFooter />

  </EmptyPage>
</>;
