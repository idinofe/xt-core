<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@dinofe/xt-core](./xt-core.md) &gt; [getStorageSize](./xt-core.getstoragesize.md)

## getStorageSize() function

获取 [Stroage](https://developer.mozilla.org/zh-CN/docs/Web/API/Storage) 存储占用空间的大小

**Signature:**

```typescript
export declare function getStorageSize(type: StorageType): IStorageSize;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | [StorageType](./xt-core.storagetype.md) | 存储类型 |

**Returns:**

[IStorageSize](./xt-core.istoragesize.md)

Stroage 存储占用空间大小

## Exceptions

[TypeError](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError) 当传入的参数 type 不是 `StorageType.localStorage | StorageType.sessionStorage` 之一时会报错：`the param type should be one of ["localStorage", "sessionStorage"]`

[Error](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error) 当 `Storage` 不可用时会报错：`window.${type} is not available`

使用时，最好先检查 `Storage` 是否可用，可以使用方法：[validateStorageAvailable(type)](./xt-core.validatestorageavailable.md)

## Remarks

同时支持 [localStroage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)<!-- -->、[sessionStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/sessionStorage)

## Example 1

获取 localStorage 占用空间大小

```ts
import { getStorageSize } from '@dinofe/xt-core/web'
const localSize = getStorageSize('localStorage')
```

## Example 2

获取 sessionStorage 占用空间大小

```ts
import { getStorageSize } from '@dinofe/xt-core/web'
const sessionSize = getStorageSize('sessionStorage')
```

## Example 3

枚举参数可以引入

```ts
import { StorageType, getStorageSize } from '@dinofe/xt-core/web'
const localSize = getStorageSize(StorageType.localStorage)
```

