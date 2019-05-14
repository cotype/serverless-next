'use strict';

module.exports = function withServerless(config) {
  /* eslint-disable-next-line no-param-reassign */
  config.assetPrefix = `https://${
    process.env.NEXT_ASSET_BUCKET_NAME
  }.s3.amazonaws.com`;
  /* eslint-disable-next-line no-param-reassign */
  config.useFileSystemPublicRoutes = false;

  return config;
};
