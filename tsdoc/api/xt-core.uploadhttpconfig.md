<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@dinofe/xt-core](./xt-core.md) &gt; [UploadHttpConfig](./xt-core.uploadhttpconfig.md)

## UploadHttpConfig type

上传 HTTP 配置

**Signature:**

```typescript
export type UploadHttpConfig = Omit<HttpConfig, 'useEncrypt' | 'commonHeaders'> & {
    authorization?: Authorization;
    signKey?: string;
};
```
**References:** [HttpConfig](./xt-core.httpconfig.md)<!-- -->, [Authorization](./xt-core.authorization.md)

