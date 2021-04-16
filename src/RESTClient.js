'use strict';

const APIRequest = require('./APIRequest');
const routeBuilder = require('./APIRouter');
const DiscordAPIError = require('./DiscordAPIError');
const HTTPError = require('./HTTPError');

const Package = require('../package.json')

function parseResponse(res) {
  if (res.headers.get('content-type').startsWith('application/json')) return res.json();
  return res.buffer();
}

class RESTClient {
  constructor(token, version, options = {}) {
    this.token = token;
    this.version = version;
    this.options = {
      tokenPrefix: options.tokenPrefix || 'Bot',
      apiBase: options.apiBase || 'https://discord.com/api',
      userAgent: `DiscordBot (${Package.homepage.split('#')[0]}, ${Package.version}) Node.js/${process.version}`,
      restRequestTimeout: 15000
    }
  }

  get api() {
    return routeBuilder(this);
  }

  getAuth() {
    if (this.token) return `${this.tokenPrefix} ${this.token}`;
    throw new Error('TOKEN_MISSING');
  }

  async request(method, url, options = {}) {
    const apiRequest = new APIRequest(this, method, url, options);
    
    // Perform the request
    let res;
    try {
      res = await request.make();
    } catch (error) {
      // Retry the specified number of times for request abortions
      throw new HTTPError(error.message, error.constructor.name, error.status, request.method, request.path);
    }

    // Handle 2xx and 3xx responses
    if (res.ok) {
      // Nothing wrong with the request, proceed with the next one
      return parseResponse(res);
    }

    // Handle 4xx responses
    if (res.status >= 400 && res.status < 500) {
      // Handle possible malformed requests
      let data;
      try {
        data = await parseResponse(res);
      } catch (err) {
        throw new HTTPError(err.message, err.constructor.name, err.status, request.method, request.path);
      }

      throw new DiscordAPIError(request.path, data, request.method, res.status);
    }

    // Handle 5xx responses
    if (res.status >= 500 && res.status < 600) {
      // Retry the specified number of times for possible serverside issues
      throw new HTTPError(res.statusText, res.constructor.name, res.status, request.method, request.path);
    }

    // Fallback in the rare case a status code outside the range 200..=599 is returned
    return null;
  }

  get endpoint() {
    if (!this.version) throw new Error('VERSION_MISSING');
    return `${this.options.apiBase}/v${this.version}`;
  }
}

module.exports = RESTClient;
