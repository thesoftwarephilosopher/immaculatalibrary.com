import { QuickLinks } from "../../components/quicklinks";
import { Head, Html, SiteFooter, SiteHeader } from "../../components/site";
import { addRouteable, Routeable } from "../../core/router";
import { LatestBookSnippets } from "../snippets/latest-list";
import cssFile from './home.css';
import headerImage from './home.jpg';
import randomBookSnippetScript from './random-book-snippet.js';
import { Container } from "../../components/container/container";
import { staticRouteFor } from "/src/core/static";

export const mainSiteHeaderImagePath = staticRouteFor(headerImage);

export const homePage: Routeable = {
  route: `/`,
  method: 'GET',
  handle: (input) => {
    return {
      body: <>
        <Html>
          <Head
            description="Free Catholic Digital Resources"
            imagePath={mainSiteHeaderImagePath}
          >
            <link rel="stylesheet" href={staticRouteFor(cssFile)} />
          </Head>
          <body>
            <SiteHeader />

            <main>

              <section id="home-hero" style={`background-image: url(${mainSiteHeaderImagePath})`}>
                <div></div>
                <div>
                  <div>
                    <h1>Immaculata Library</h1>
                    <p>Free Digital Catholic Books</p>
                  </div>
                </div>
              </section>

              <Container spaced split>

                <div>
                  <div class="home content">

                    <h3>Letters from Heaven</h3>
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
                            <a href="https://archive.org/details/an-introduction-to-the-devout-life/page/77?view=theater">77</a>
                          </p>
                        </li>
                      </ul>
                    </blockquote>

                  </div>
                  <br />
                  <LatestBookSnippets />
                </div>
                <div>

                  <div>
                    <h3>Random Book Snippet (<a href='#' id='refresh-random-book-snippet'>Another</a>)</h3>
                    <noscript>Enable JavaScript to see a random book snippet</noscript>
                    <div id="random-book-snippet" class="content"></div>
                  </div>
                  <script src={staticRouteFor(randomBookSnippetScript)}></script>

                </div>

              </Container>

            </main>

            <QuickLinks />
            <SiteFooter input={input} />
          </body>
        </Html>
      </>
    };
  },
};

const redirectHomePageRoute: Routeable = {
  route: '/index.html',
  method: 'GET',
  handle: (input) => ({
    status: 302,
    headers: { 'Location': '/' },
  })
};

addRouteable(homePage);
addRouteable(redirectHomePageRoute);
