const url = require('url');
const fs = require('fs');
const yaml = require('js-yaml');

const required_keys = ['storage', 'redis']

class Config {
  constructor(path) {
    let config = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    for(let k in config) this[k]=config[k];

    for(let k of required_keys) {
      if (!this[k]) {
        throw new Error(`Missing 'storage' property in config file: ${path}`);
      }
    }
    if (this.storage.url) { this.storageUrl = this.storage.url; }
    if (this.storage.envKey) { this.storageUrl = process.env[this.storage.envKey]; }
    if (this.redis.uri) { this.redisUrl = this.redis.uri; }
    if (this.redis.envKey) { this.redisUrl = process.env[this.redis.envKey]; }
    if (!this.address) { this.address = process.env['TOKEN_APP_ID']; }
    if (!this.paymentAddress) { this.paymentAddress = process.env['TOKEN_APP_PAYMENT_ADDRESS']; }
    if (!this.seedMnemonic) { this.seedMnemonic = process.env['TOKEN_APP_SEED']; }
  }

  set storageUrl(s) {
    if (s.startsWith('postgres://') || s.startsWith('postgresql://')) {
      this.storage.postgres = {url: s};
    } else if (s.startsWith('sqlite://')) {
      this.storage.sqlite = {url: s};
    } else {
      this.storage = {url: s};
    }
  }

  set redisUrl(s) {
    let uri = url.parse(s);
    if (uri.protocol && uri.protocol == 'redis:') {
      this.redis.host = uri.hostname;
      this.redis.port = uri.port;
      if (uri.auth && uri.auth.indexOf(':') > -1) {
        this.redis.password = uri.auth.split(':')[1];
      }
    }
  }
}

module.exports = Config;
