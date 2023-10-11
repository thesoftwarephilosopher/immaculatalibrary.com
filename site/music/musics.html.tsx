import { Column } from "../components/column/column";
import { MusicSidebar } from "../components/music-sidebar";
import { TypicalPage } from "../components/page";
import { Typography } from "../components/typography";
import { markdown } from "../core/helpers";
import { allMusics } from '../model/musics';

export default allMusics.map(song => {
  const embedUrl = song.data.youtube.replace('watch?v=', 'embed/').replace(/&t=(\d+)s/, '?start=$1');
  return [`${song.slug}.html`, <>
    <TypicalPage image='/img/page/music.jpg'>

      <link rel="stylesheet" href='/css/view-song.css' />

      <Column spaced split>

        <Typography>
          <h1>{song.data.title}</h1>
          <div class="embed-container">
            <iframe allowfullscreen="allowfullscreen" frameborder="0" src={embedUrl}></iframe>
          </div>
          {markdown.render(song.content)}
        </Typography>

        <MusicSidebar />

      </Column>

    </TypicalPage >
  </>];
});
