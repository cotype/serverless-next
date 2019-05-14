'use strict';

const proxy = require('http-proxy-middleware');
const serverless = require('serverless-http');
const express = require('express');
const cached = require('./cached');

module.exports = cached(() => {
  const app = express();

  app.use(
    proxy(`http://localhost:${process.env.NEXT_PORT}`, {
      changeOrigin: true,
      logLevel: 'warn',
    }),
  );

  return serverless(app);
});
