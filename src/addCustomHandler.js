'use strict';

const path = require('path');
const merge = require('lodash.merge');

module.exports = function addCustomHandler(serverless) {
  merge(serverless.service, {
    custom: {
      'serverless-nextjs': {
        customHandler: `./${path.relative(
          serverless.config.servicePath,
          require.resolve('../handlers/prod.js'),
        )}`,
      },
    },
  });
};
