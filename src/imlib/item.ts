import { Compiler } from "./compiler";
import { SerializableObject } from "./db";
import { ViewSite } from "./site";

export interface ViewItem {
  $id: string;
  $data: { [key: string]: any };
  $items: ViewItem[];
  $type: ViewItem | undefined;
  [key: string]: any;
}

export class Item {

  type: Item | null = null;
  items: Item[] = [];
  data = Object.create(null);
  viewItem: ViewItem = Object.create(null);

  constructor(
    public readonly id: string,
    public readonly raw: SerializableObject,
  ) { }

  compute(compiler: Compiler, source: any, target: any) {
    for (let [key, val] of Object.entries<any>(source)) {
      if (typeof val?.$eval === 'string') {
        val = compiler.eval({
          this: this.viewItem,
          body: val.$eval,
        });
      }
      target[key] = val;
    }
  }

  populateViewItem() {
    Object.assign(this.viewItem, this.data);
    hardSet(this.viewItem, '$id', this.id);
    hardSet(this.viewItem, '$data', this.raw);
    hardSet(this.viewItem, '$items', this.items.map(it => it.viewItem));
    hardSet(this.viewItem, '$type', this.type?.viewItem);
  }

  boot(viewSite: ViewSite) {
    const boot = this.viewItem['$boot'];
    if (typeof boot === 'function') {
      try {
        boot(viewSite);
      }
      catch (e) {
        console.error(`Error when booting:`, this.id);
        throw e;
      }
    }

    for (const item of this.items) {
      item.boot(viewSite);
    }
  }

}

function hardSet(target: any, key: string, value: any) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
  });
}
