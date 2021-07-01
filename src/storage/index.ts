import Dexie from 'dexie'

interface DStorageOptions {
  name: string            // 数据库名
  version: number         // 版本号
  tables: {               // 数据库表
    [k: string]: string
  }
}

interface DStorageORM {
  add: () => void
  remove: () => void
  update: () => void
  list: () => void
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
  configTable(tables: { [k: string]: string }) {
    for (const tableName in tables) {
      if (Object.prototype.hasOwnProperty.call(tables, tableName)) {
        const table = this.table(tableName)
        this[tableName] = table as DStorageTable
      }
    }
  }
  clean() {
    
  }
  reset() {

  }
}

export default DStorage
