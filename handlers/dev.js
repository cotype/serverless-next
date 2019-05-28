'use strict';

const { stripPrefix } = require('./prod');
const getProxy = require('../src/proxy');

const redirects = ['/_next/on-demand-entries-ping', '/_next/webpack-hmr'];

exports.next = async function nextDevHandler(event, context) {
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

      return {
        statusCode: 307,
        headers: {
          Location: `http://localhost:${process.env.NEXT_PORT}${redirect}${q}`,
        },
      };
    }
  }

  return (await getProxy())(
    stripPrefix(event, process.env.NEXT_BASE_PATH),
    context,
  );
};
