import * as purity from '@sdegutis/purity';
import 'dotenv/config';
import 'source-map-support/register';

main();
async function main() {

  const oldDb = new purity.JsonDirDatabase('data');
  const newDb = new purity.S3Database('imlibv3');

  const oldItems = await oldDb.load();
  const newItems = await newDb.load();

  for (const [key, val] of oldItems) {
    newItems.set(key, val);
  }

  newDb.save(newItems.keys());
  newDb.saveIfNeeded();

}
