/* eslint-disable no-underscore-dangle */

'use strict';

const merge = require('lodash.merge');
const startLocalNext = require('./startLocalNext');

module.exports = function serveOffline(serverless, plugin) {
  return async () => {
    const { basePath } = plugin.getOptions();

    global.__COTYPE_NEXT_DATA__ = global.__COTYPE_NEXT_DATA__ || {};
    global.__COTYPE_NEXT_DATA__.basePath = basePath;

    const port = await startLocalNext(serverless, plugin);

    merge(serverless.service, {
      functions: {
        next: {
          handler: `node_modules/@cotype/serverless-next/handlers/dev.next`,
          timeout: 30,
          environment: {
            NEXT_PORT: port,
            NEXT_BASE_PATH: basePath,
          },
          events: [
            {
              http: {
                path: '/next',
                method: 'ANY',
                cors: true,
              },
            },
            {
              http: {
                path: '/next/{any+}',
                method: 'ANY',
                cors: true,
              },
            },
          ],
        },
      },
    });
  };
};
