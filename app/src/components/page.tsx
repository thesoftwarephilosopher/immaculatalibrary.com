export const Container: Component<{ spaced?: boolean, split?: boolean }> = (attrs, children) => {
  const cssClass: string[] = [];
  if (attrs.spaced ?? true) cssClass.push('spaced-main-content');
  if (attrs.split ?? true) cssClass.push('split-page');
  return <>
    <div class="container">
      <section class={cssClass.join(' ')}>
        {children}
      </section>
    </div>
  </>;
};

export const Content: Component<{}> = (attrs, children) => <>
  <div class="content">
    {children}
  </div>
</>;
