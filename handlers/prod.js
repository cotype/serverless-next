/* eslint-disable no-underscore-dangle */

'use strict';

const compat = require('next-aws-lambda');

function stripPrefix(event, prefix) {
  if (!prefix) {
    return event;
  }

  if (!event.path.match(new RegExp(`^${prefix}`))) {
    return event;
  }

  const strip = (path) => path.replace(new RegExp(`^${prefix}`), '');

  return {
    ...event,
    path: strip(event.path),
    resource: strip(event.resource),
    requestContext: {
      ...event.requestContext,
      resourcePath: strip(event.requestContext.resourcePath),
    },
  };
}

function exposeStage(event) {
  global.__COTYPE_NEXT_DATA__ = {};
  if (event.headers['X-Cotype-Next-Stage']) {
    global.__COTYPE_NEXT_DATA__.stage = event.headers['X-Cotype-Next-Stage'];
  }
}

module.exports = (page) => {
  return (event, context, callback) => {
    exposeStage(event);
    compat(page)(stripPrefix(event), context, callback);
  };
};

module.exports.stripPrefix = stripPrefix;
