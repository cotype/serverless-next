'use strict';

const path = require('path');
const merge = require('lodash.merge');

module.exports = function addPackageFiles(serverless) {
  const compatPath = require.resolve('next-aws-lambda');
  merge(serverless.service, {
    package: {
      include: [
        path.relative(
          serverless.config.servicePath,
          require.resolve('../handlers/prod.js'),
        ),
        path.relative(serverless.config.servicePath, compatPath),
        path.relative(
          serverless.config.servicePath,
          path.resolve(compatPath, '..', 'lib', '**'),
        ),
      ],
    },
  });
};
