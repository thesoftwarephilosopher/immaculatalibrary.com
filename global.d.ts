declare module JSX {
  export type IntrinsicElements = {
    [tag: string]: Record<string, string | boolean>;
  };
  export type Element = import('./src/jsx').JsxElement;
  export type Component<T extends Record<string, any> = {}> =
    (attrs: T, children: any) => Element;
}

type FsFile = {
  path: string;
  content: Buffer;
};

declare module '*/' {
  const dir: FsFile[];
  export default dir;
}

declare module '*.css' {
  const file: FsFile;
  export default file;
}

declare module '*.js' {
  const file: FsFile;
  export default file;
}
