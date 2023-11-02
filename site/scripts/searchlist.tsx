import { jsxToElement } from "./jsx-nodes.js";
import { Reactive } from "./reactive.js";

export interface SearchFilter<T> {
  source: Reactive<any>;
  matches: (data: T) => boolean,
}

const NotFound: JSX.Component<{ visibleCount: Reactive<number> }> = ({ visibleCount }, children) => {
  const notFound = jsxToElement(<em>No results</em>) as HTMLElement;
  visibleCount.onChange(() => {
    notFound.hidden = visibleCount.val !== 0;
  });
  return <>{notFound}</>;
}

export function createSearch<T>({ data, makeUi, filters, container, counter }: {
  data: T[];
  makeUi: (item: T) => JSX.Element;
  filters: SearchFilter<T>[];
  container: HTMLElement,
  counter: HTMLElement,
}) {
  const visibleItems = new Reactive<typeof items>([]);
  const visibleCount = new Reactive(0);

  container.innerHTML = '';

  const ul = document.createElement('ul');
  container.append(ul);

  container.append(jsxToElement(
    <NotFound visibleCount={visibleCount} />
  ));

  visibleCount.onChange(() => {
    counter.textContent = visibleCount.val.toFixed();
  });

  visibleItems.onChange(() => {
    visibleCount.set(visibleItems.val.length);
  });

  const items = data.map(data => {
    const element = jsxToElement(makeUi(data)) as HTMLLIElement;
    const item = { data, element };
    visibleItems.onChange(() => {
      element.hidden = !visibleItems.val.includes(item);
    });
    return item;
  });

  for (const item of items) {
    ul.append(item.element);
  }

  for (const filter of filters) {
    filter.source.onChange(search);
  }

  function search() {
    visibleItems.set(items.filter(item => {
      for (const filter of filters) {
        if (!filter.matches(item.data)) {
          return false;
        }
      }
      return true;
    }));
  }

  search();
}
