'use strict';

const ServerlessNext = require('@xiphe/serverless-nextjs-plugin');

function routePath(pattern, keys) {
  return keys
    .reduce((p, key) => {
      return p.replace(new RegExp(`:${key.name}/`), `{${key.name}}/`);
    }, `${pattern}/`)
    .replace(/\/$/g, '');
}

function injectCustom(serverless) {
  // eslint-disable-next-line no-param-reassign
  serverless.service.custom = serverless.service.custom || {};
  const { custom } = serverless.service;

  custom['serverless-nextjs'] = custom['serverless-nextjs'] || {};
  const slsnxt = custom['serverless-nextjs'];

  slsnxt.nextConfigDir = slsnxt.nextConfigDir || './';
  slsnxt.customHandler =
    'node_modules/@cotype/serverless-next/src/prodHandler.js';
}

module.exports = class CotypeServerlessNext extends ServerlessNext {
  constructor(serverless, options) {
    injectCustom(serverless);
    super(serverless, options);

    this.opts = {
      ...this.getDefaultOptions(),
      ...(serverless.service.custom || {}).next,
      ...options,
    };

    process.env.NEXT_ASSET_BUCKET_NAME = this.opts.assetBucketName;

    this.hooks['before:offline:start'] = this.serveOffline.bind(this);
    this.hooks['before:offline:start:init'] = this.serveOffline.bind(this);

    const originalPackageInit = this.hooks['before:package:initialize'];
    const originalBuildNextPages = this.hooks[
      'before:deploy:function:initialize'
    ];
    const originalUploadArtifacts = this.hooks[
      'after:aws:deploy:deploy:uploadArtifacts'
    ];
    let uploaded = false;
    this.hooks['after:aws:deploy:deploy:uploadArtifacts'] = async () => {
      try {
        await originalUploadArtifacts();
        uploaded = true;
      } catch (e) {
        if (e.message === 'The specified bucket does not exist') {
          serverless.cli.log(
            `Bucket ${this.opts.assetBucketName} does not exist yet...`,
          );
          return;
        }

        throw e;
      }
    };

    this.hooks['before:package:initialize'] = async () => {
      this.createRoutes();
      await originalPackageInit();
      this.mutateNextFunctions();
    };
    this.hooks['before:deploy:function:initialize'] = async () => {
      this.createRoutes();
      await originalBuildNextPages();
      this.mutateNextFunctions();
    };

    this.hooks['after:aws:deploy:deploy:updateStack'] = async () => {
      if (!uploaded) {
        serverless.cli.log('Retrying asset upload...');
        await originalUploadArtifacts();
      }
    };
  }

  async serveOffline() {
    const { service } = this.serverless;
    const port = await this.startNext();

    service.functions.next = {
      handler: `node_modules/@cotype/serverless-next/src/devHandler.next`,
      timeout: 30,
      environment: {
        NEXT_PORT: port,
        NEXT_BASE_PATH: this.opts.basePath,
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
    };
  }

  async startNext() {
    this.serverless.cli.log(`Starting next dev server...`);

    const next = require('next');
    const getPort = require('get-port');
    const url = require('url');
    const http = require('http');

    const app = next({ dev: true });
    app.setAssetPrefix(this.opts.basePath);

    const handler = (req, res) => {
      return this.getRoutes().getRequestHandler(app)(
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

    this.serverless.cli.log(`Done on port ${port}`);

    return port;
  }

  mutateNextFunctions() {
    Object.values(this.serverless.service.functions).forEach((funct) => {
      if (!funct.handler.match(/^sls-next-build\//)) {
        return;
      }

      funct.events.forEach(({ http }) => {
        /* eslint-disable-next-line no-param-reassign */
        http.path = `${this.opts.basePath}${http.path}`;
      });
    });
  }

  getDefaultOptions() {
    return {
      basePath: '/next',
      assetBucketName: `${this.serverless.service.getServiceName()}-${
        process.env.NODE_ENV
      }-next-assets`,
    };
  }

  getRoutes() {
    const nextRouting = require('@xiphe/next-routing');

    return nextRouting({
      root: this.serverless.config.servicePath,
    });
  }

  createRoutes() {
    const { routes } = this.getRoutes();

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

    this.serverless.service.custom['serverless-nextjs'].pageConfig = pageConfig;
  }
};
