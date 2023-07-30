import { Container } from "../../components/container/container";
import { Content } from "../../components/content/content";
import { SiteCommon } from "../../components/site";
import { renderElement } from "../../core/jsx";
import { addRouteable } from "../../core/router";
import { staticRouteFor } from "../../util/static";

addRouteable({
  route: '/500.html',
  method: 'GET',
  handle: () => {
    const title = 'Something went wrong';
    const image = staticRouteFor(__dir.filesByName['404.jpg']!);
    return {
      status: 500,
      body: renderElement(<SiteCommon
        title={title}
        image={image}
      >
        <Container spaced split>

          <Content>
            <h1>{title}</h1>
            <p>Sorry, this page had an error. Try again later.</p>
          </Content>

        </Container>
      </SiteCommon>)
    };
  },
})
