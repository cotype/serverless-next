'use strict';

module.exports = function withServerless(config) {
  return {
    ...config,
    assetPrefix: `https://${
      process.env.NEXT_ASSET_BUCKET_NAME
    }.s3.amazonaws.com`,
    useFileSystemPublicRoutes: false,
  };
};
