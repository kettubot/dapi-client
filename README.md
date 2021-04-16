# dapi-client

A small library for interacting with Discord's API from JavaScript. This code is directly based off the private `client#api` API in [discord.js](https://discord.js.org).

> The ratelimit handling code has been removed. This is intentional, as the utility is designed to work behind a Discord proxy to handle ratelimiting for you instead.

## Usage

Install with `npm install kettubot/dapi-client` because I don't want to publish this as an actual npm package.

```js
const apiclient = require('dapi-client')

// new apiClient(token, apiVersion, options) - all options are optional (haha)
const client = new apiClient('token', 8, {
  tokenPrefix: 'Bot', // prefix for token
  apiBase: 'https://discord.com/api', // dAPI base url, change for api proxies
  userAgent: 'blah blah', // user agent for requests
  restRequestTimeout: 15000 // timeout for requests
})

const user = await client.api.users('@me').get()
```