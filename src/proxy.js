'use strict';

const proxy = require('http-proxy-middleware');
const serverless = require('serverless-http');
const connect = require('connect');
const memoize = require('memoize-one');

function getDefault(mdl) {
  if (mdl.default) {
    return mdl.default;
  }

  return mdl;
}

const DEFAULT_OPTIONS = {
  changeOrigin: true,
  logLevel: 'warn',
};

module.exports = getDefault(memoize)((target, options = DEFAULT_OPTIONS) => {
  const app = connect();

  app.use((req, res, next) => {
    proxy(target, options)(req, res, next);
  });

  return serverless(app);
});
