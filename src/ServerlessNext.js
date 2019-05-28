'use strict';

const ServerlessNext = require('serverless-nextjs-plugin');
const addCustomHandler = require('./addCustomHandler');
const addPackageFiles = require('./addPackageFiles');
const serveOffline = require('./serveOffline');
const retryUploadArtifacts = require('./retryUploadArtifacts');
const injectHook = require('./injectHook');
const createRoutes = require('./createRoutes');
const mutateNextFunctions = require('./mutateNextFunctions');

module.exports = class CotypeServerlessNext extends ServerlessNext {
  constructor(serverless, options) {
    addCustomHandler(serverless);
    super(serverless, options);

    this.$$serverless = serverless;
    this.$$options = options;
    addPackageFiles(serverless);

    const offline = serveOffline(serverless, this);

    this.hooks['before:offline:start'] = offline;
    this.hooks['before:offline:start:init'] = offline;

    retryUploadArtifacts(serverless, this);

    this.hooks['after:aws:common:validate:validate'] = () => {
      process.env.NEXT_ASSET_BUCKET_NAME = this.getOptions().assetBucketName;
    };

    injectHook(
      serverless,
      this,
      ['before:package:initialize', 'before:deploy:function:initialize'],
      createRoutes,
      mutateNextFunctions,
    );
  }

  getOptions() {
    return {
      basePath: '/next',
      assetBucketName: `${this.$$serverless.service.getServiceName()}-${
        process.env.NODE_ENV
      }-next-assets`,
      ...(this.$$serverless.service.custom || {}).next,
      ...this.$$options,
    };
  }
};
