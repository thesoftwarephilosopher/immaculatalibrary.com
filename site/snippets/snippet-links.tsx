export interface SubSnippet {
  route: string,
  data: { archivePage: string },
}

interface Snippet {
  book: {
    route: string,
    snippets: { length: number },
  },
  prevSnippet?: SubSnippet,
  nextSnippet?: SubSnippet,
}

export function PrevNextLinks(attrs: {
  snippet: Snippet,
  otherLink: JSX.Component<{ snippet: SubSnippet | undefined }>,
}) {
  return <>
    <link rel='stylesheet' href='/snippets/snippet-links.css' />
    <div class='prevnextlinks'>
      <span class='header'>Other snippets in this book</span>
      <div>
        <attrs.otherLink snippet={attrs.snippet.prevSnippet}>Previous</attrs.otherLink>
        <span>
          <a href={attrs.snippet.book.route}>All</a>
          <br />
          {attrs.snippet.book.snippets.length} total
        </span>
        <attrs.otherLink snippet={attrs.snippet.nextSnippet}>Next</attrs.otherLink>
      </div>
    </div>
  </>;
}

export function RelativeSnippetLink({ snippet }: { snippet: SubSnippet | undefined }, children: any) {
  return <>
    <span>
      {snippet && <>
        <a href={snippet.route}>{children}</a><br />
        p.{snippet.data.archivePage}
      </>}
    </span>
  </>;
}
