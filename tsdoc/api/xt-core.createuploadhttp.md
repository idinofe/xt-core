<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@dinofe/xt-core](./xt-core.md) &gt; [createUploadHttp](./xt-core.createuploadhttp.md)

## createUploadHttp() function

创建上传文件 HTTP 实例（Web 环境）

**Signature:**

```typescript
export declare function createUploadHttp(appConfig: UploadAppConfig, config?: UploadHttpConfig): UploadInstance;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  appConfig | [UploadAppConfig](./xt-core.uploadappconfig.md) | appConfig |
|  config | [UploadHttpConfig](./xt-core.uploadhttpconfig.md) | _(Optional)_ config |

**Returns:**

[UploadInstance](./xt-core.uploadinstance.md)

返回 HTTP 实例

## Remarks

注意：

1. 使用了 FormData，故只能在 web 环境使用

2. 返回值是 UploadInstance 实例，建议只使用其 upload 方法， ApisauceInstance 实例提供的其他发请求方法不要使用，可能导 致错误逻辑

