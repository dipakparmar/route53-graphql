# Route53 API in GraphQL

An [Apollo GraphQL](https://www.apollographql.com/) server, built with [Cloudflare Workers](https://workers.cloudflare.com). [Try a demo by looking at a deployed GraphQL playground](https://route53.dipak.io/playground).

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/dipakparmar/route53-graphql)

## Usage

You can run it locally by [installing Wrangler](https://workers.cloudflare.com/docs/quickstart/), the Workers command-line tool:

```sh
wrangler dev
```

### Global Headers

| Header Name       | Value | Type   | Description                                                    |
| ----------------- | ----- | ------ | -------------------------------------------------------------- |
| `X-ACCESS-KEY`    |       | String | ACCESS Key of IAM USER (Required)                              |
| `X-ACCESS-SECRET` |       | String | ACCESS SECRET Of IAM USER (Required)                           |
| 'X-SESSION-TOKEN' |       | String | SESSION TOKEN Of IAM USER (If using Temporary IAM Credentials) |

## License

This project is licensed with the [AGPL-3.0 License](https://github.com/dipakparmar/route53-graphql/blob/main/LICENSE).
