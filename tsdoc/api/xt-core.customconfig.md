<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@dinofe/xt-core](./xt-core.md) &gt; [CustomConfig](./xt-core.customconfig.md)

## CustomConfig interface

HTTP 自定义配置

**Signature:**

```typescript
export interface CustomConfig 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [appKey?](./xt-core.customconfig.appkey.md) |  | string | _(Optional)_ |
|  [commonHeaders?](./xt-core.customconfig.commonheaders.md) |  | (request: [CustomAxiosRequestConfig](./xt-core.customaxiosrequestconfig.md)<!-- -->) =&gt; Record&lt;string, any&gt; \| Promise&lt;Record&lt;string, any&gt;&gt; | _(Optional)_ |
|  [commonParams?](./xt-core.customconfig.commonparams.md) |  | (request: [CustomAxiosRequestConfig](./xt-core.customaxiosrequestconfig.md)<!-- -->) =&gt; Record&lt;string, any&gt; \| Promise&lt;Record&lt;string, any&gt;&gt; | _(Optional)_ |
|  [encryptVersion?](./xt-core.customconfig.encryptversion.md) |  | [EncryptVersion](./xt-core.encryptversion.md) | _(Optional)_ |
|  [isInvalidToken?](./xt-core.customconfig.isinvalidtoken.md) |  | (data: any, response: [XApiResponse](./xt-core.xapiresponse.md)<!-- -->&lt;any, any&gt;) =&gt; boolean | _(Optional)_ |
|  [nestBizData?](./xt-core.customconfig.nestbizdata.md) |  | boolean \| string | _(Optional)_ commonParams 基础参数与业务参数保持嵌套 true \| undefined: 保持嵌套在 body 下 false: 不嵌套 string: 签到在 nestBizData 下； 默认：undefined； 在 encryptVersion = '2' 时嵌套在 body 下，此配置无效 |
|  [noFail?](./xt-core.customconfig.nofail.md) |  | boolean | _(Optional)_ |
|  [noStatusTransform?](./xt-core.customconfig.nostatustransform.md) |  | boolean | _(Optional)_ |
|  [onFail?](./xt-core.customconfig.onfail.md) |  | (msg: [FailMessageType](./xt-core.failmessagetype.md)<!-- -->, response: [XApiResponse](./xt-core.xapiresponse.md)<!-- -->&lt;any, any&gt;) =&gt; void | _(Optional)_ |
|  [onInvalidToken?](./xt-core.customconfig.oninvalidtoken.md) |  | (response: [XApiResponse](./xt-core.xapiresponse.md)<!-- -->&lt;any, any&gt;) =&gt; void | _(Optional)_ |
|  [useEncrypt?](./xt-core.customconfig.useencrypt.md) |  | boolean | _(Optional)_ |
|  [useSign?](./xt-core.customconfig.usesign.md) |  | boolean | _(Optional)_ |

