import { Container } from "../../../components/container/container";
import { Content } from "../../../components/content/content";
import { SiteCommon } from "../../../components/site";
import { renderElement } from "../../../core/jsx";
import { addRouteable, Routeable } from "../../../core/router";
import { allMovies } from "../../../model/models";
import { MoviesSidebar } from "../movies-sidebar";

const image = allMovies[0]!.bigImage;

export const allMoviesPage: Routeable = {
  route: `/movies.html`,
  handle: () => {
    const title = 'Holy Movies';
    return {
      body: renderElement(<>
        <SiteCommon
          title={title}
          image={image}
        >
          <Container spaced split>
            <Content>
              <h1>{title}</h1>
              <p>
                Books are not the only way to experience the
                lives of the saints! Movies can be a great way
                to increase our devotion and love for God through
                his Saints. This page contains a roughly priotized
                list of recommended and reviewed Catholic movies.
              </p>
            </Content>
            <MoviesSidebar />
          </Container>
        </SiteCommon>
      </>)
    };
  },
};

addRouteable(allMoviesPage);
