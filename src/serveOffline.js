'use strict';

const merge = require('lodash.merge');
const startLocalNext = require('./startLocalNext');

module.exports = function serveOffline(serverless, plugin) {
  return async () => {
    const port = await startLocalNext(serverless, plugin);

    merge(serverless.service, {
      functions: {
        next: {
          handler: `node_modules/@cotype/serverless-next/handlers/dev.next`,
          timeout: 30,
          environment: {
            NEXT_PORT: port,
            NEXT_BASE_PATH: plugin.getOptions().basePath,
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
