<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@dinofe/xt-core](./xt-core.md) &gt; [convertBlobToUrl](./xt-core.convertblobtourl.md)

## convertBlobToUrl() function

文件对象转为 URL 链接

**Signature:**

```typescript
export declare function convertBlobToUrl(blob: Blob | File): {
    url: string;
    revoke: () => void;
};
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  blob | Blob \| File | [Blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob) 或 [File](https://developer.mozilla.org/zh-CN/docs/Web/API/File) 文件对象 |

**Returns:**

{ url: string; revoke: () =&gt; void; }

结果对象 `{ url: string, revoke: Function }`

## Remarks

使用 [URL.createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL_static)

## Example


```ts
import { convertBlobToUrl } from '@dinofe/xt-core/web'
const file = e.target.files[0] // input元素的change事件的
const { url } = convertBlobToUrl(file)
console.log(url)
```

