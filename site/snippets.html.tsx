import { Column, Spaced } from "./components/column.js";
import { TypicalPage } from "./components/page.js";
import { RandomBookSnippet } from "./components/random-snippet.js";
import { SnippetsGroups } from "./components/snippet-groups.js";
import { WordSep } from "./components/word-sep.js";
import { allSnippets } from "./model/snippets.js";
import { calculateReadingMins } from './shared/helpers.js';

const totalReadingMins = calculateReadingMins(allSnippets.map(s => s.content).join('\n\n'));
const mins = Math.round(totalReadingMins % 60);
const hours = Math.floor(totalReadingMins / 60);
const totalReadingTime = `${hours}h ${mins}m`;

export default <>
  <TypicalPage title="Book Snippets" image='/img/categories/reference-big.jpg'>

    <script type='module' src='/scripts/search-book-snippets.js' />

    <Spaced>
      <Column split>

        <div>

          <h2>Find Book Snippets</h2>

          <p><input placeholder='Search' autofocus type="text" id="search-book-snippets-field" /></p>

          <p>
            Not sure what to read?<br />
            Try a <RandomBookSnippet>
              <a href='#'>Random Book Snippet</a>
            </RandomBookSnippet>.
          </p>

        </div>

        <div>

          <h2>Showing book snippets</h2>

          <p>
            {allSnippets.length} total
            <WordSep />
            {totalReadingTime}
          </p>

          <div id='search-results'>
            <SnippetsGroups filter={{ type: 'all' }} />
          </div>

        </div>

      </Column>
    </Spaced>

  </TypicalPage>
</>;
