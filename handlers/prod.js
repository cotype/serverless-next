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

function exposeCotype(event) {
  const nextData = {};
  if (event.headers['X-Cotype-Next-Stage']) {
    nextData.stage = event.headers['X-Cotype-Next-Stage'];
    nextData.basePath = `${process.env.BASE_PATH}/${
      event.headers['X-Cotype-Next-Stage']
    }`;
  } else {
    nextData.basePath = `${process.env.BASE_PATH}${process.env.NEXT_BASE_PATH}`;
  }

  global.__COTYPE_NEXT_DATA__ = nextData;
}

module.exports = (page) => {
  return (event, context, callback) => {
    exposeCotype(event);
    compat(page)(
      stripPrefix(event, process.env.NEXT_BASE_PATH),
      context,
      callback,
    );
  };
};

module.exports.stripPrefix = stripPrefix;
