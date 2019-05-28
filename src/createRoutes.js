'use strict';

const merge = require('lodash.merge');
const getRoutes = require('./getRoutes');

function routePath(pattern, keys) {
  return keys
    .reduce((p, key) => {
      return p.replace(new RegExp(`:${key.name}/`), `{${key.name}}/`);
    }, `${pattern}/`)
    .replace(/\/$/g, '');
}

module.exports = function createRoutes(serverless) {
  const { routes } = getRoutes(serverless.config.servicePath);

  const pageConfig = routes.reduce((c, route) => {
    return {
      ...c,
      [route.page === '/' ? 'index' : route.page.replace(/^\//, '')]: {
        events: [
          {
            http: {
              path: routePath(route.pattern, route.keys),
              request: {
                parameters: {
                  paths: route.keys.reduce((memo, key) => {
                    return {
                      ...memo,
                      [key.name]: !key.optional,
                    };
                  }, {}),
                },
              },
            },
          },
        ],
      },
    };
  }, {});

  merge(serverless.service, {
    custom: {
      'serverless-nextjs': {
        pageConfig,
      },
    },
  });
};
