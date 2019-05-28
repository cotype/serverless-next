'use strict';

module.exports = async function startNext(serverless, plugin) {
  serverless.cli.log(`Starting next dev server...`);

  const getRoutes = require('./getRoutes');
  const next = require('next');
  const getPort = require('get-port');
  const url = require('url');
  const http = require('http');

  const app = next({ dev: true });
  app.setAssetPrefix(plugin.getOptions().basePath);

  const handler = (req, res) => {
    return getRoutes(serverless.config.servicePath).getRequestHandler(app)(
      req,
      res,
      url.parse(req.url, true),
    );
  };
  const prepareP = app.prepare();

  const port = await getPort();

  await new Promise((res, req) => {
    http
      .createServer(handler)
      .listen(port, (err) => (err ? req(err) : res(port)));
  });
  await prepareP;

  serverless.cli.log(`Done on port ${port}`);

  return port;
};
