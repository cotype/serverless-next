/* eslint-disable no-underscore-dangle */

'use strict';

const { stripPrefix } = require('./prod');
const proxy = require('../src/proxy');

const redirects = ['/_next/on-demand-entries-ping', '/_next/webpack-hmr'];

exports.next = function nextDevHandler(event, context) {
  const localNextUrl = `http://localhost:${process.env.NEXT_PORT}`;
  for (let i = 0, l = redirects.length; i < l; i += 1) {
    const redirect = redirects[i];

    if (
      event.path.match(new RegExp(`^${process.env.NEXT_BASE_PATH}${redirect}`))
    ) {
      const q = event.queryStringParameters
        ? `?${Object.entries(event.queryStringParameters)
            .map((p) => p.join('='))
            .join('&')}`
        : '';

      return Promise.resolve({
        statusCode: 307,
        headers: {
          Location: [localNextUrl, redirect, q].join(''),
        },
      });
    }
  }

  return proxy(localNextUrl)(
    stripPrefix(event, process.env.NEXT_BASE_PATH),
    context,
  );
};
