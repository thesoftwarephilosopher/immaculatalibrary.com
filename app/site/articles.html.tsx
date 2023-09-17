import * as Common from "../components/common";
import { calculateReadingMins, excerpt, formatDate, markdown } from "../core/helpers";
import { allArticles } from "../model/models";

export default <>
  <link rel="stylesheet" href="/css/articles.css" />

  <Common.Page>

    <Common.SiteHeader image='/img/page/articles.jpg' />
    <Common.Navlinks />

    <main>

      <Common.Column spaced>

        <h1>Articles</h1>
        <ul class="all-blog-posts">
          {allArticles.map(article => <>
            <li class="post-row">
              <div>
                <a class="title" href={article.route}>
                  {article.title}
                </a>
                <span class="date">
                  {formatDate(article.date)} &bull; {calculateReadingMins(article.content)} min
                </span>
                <div class="excerpt">
                  {markdown.render(excerpt(article.content))}
                </div>
              </div>
            </li>
          </>)}
        </ul>

      </Common.Column>

    </main>

    <Common.QuickLinks />
    <Common.SiteFooter />

  </Common.Page>
</>;
