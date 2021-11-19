import Dexie, { PromiseExtended, Table } from 'dexie'

interface DTable {
  [k: string]: string
}

interface DStorageOptions {
  name: string            // 数据库名
  version: number         // 版本号
  tables: DTable          // 数据库表
}

interface DStorageORM extends Table {
  // add: () => void
  // update: () => void
  remove: (key: any) => PromiseExtended<void>;
  list: (key: any) => PromiseExtended<void>;
}

type DStorageTable = Dexie.Table | {
  [k: string]: DStorageORM
}

class DStorage extends Dexie {
  [k: string]: DStorageORM | any // TODO: 根据options.tables的key动态生成索引签名
  public constructor(options: DStorageOptions) {
    super(options.name)
    this.version(options.version).stores(options.tables)
    this.configTable(options.tables)
  }
  configTable(tables: DTable) {
    for (const tableName in tables) {
      if (Object.prototype.hasOwnProperty.call(tables, tableName)) {
        const table = this.table(tableName)
        this[tableName] = table as DStorageTable
      }
    }
  }
  clean() {
    for (const key in this) {
      if (this[key].clear) {
        this[key].clear()
      }
    }
  }
  /**
   * @deprecated
   */
  reset() {

  }
}

let d = new DStorage({ name: 't', version: 1, tables: { a: '++id,timestamp,content,createdAt' } })

export default DStorage
