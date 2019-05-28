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

module.exports = (page) => {
  return (event, context, callback) => {
    // this makes sure the next page renders
    compat(page)(stripPrefix(event), context, callback);
  };
};

module.exports.stripPrefix = stripPrefix;
