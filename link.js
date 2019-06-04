'use strict';

const Link = require('next/link').default;
const { withRouter } = require('next/router');
const { createElement } = require('react');
const { Context } = require('./app');

function absolute(href, basePath) {
  const url = new URL(href, `http://a.b${basePath.replace(/\/$/, '')}/`)
    .pathname;

  return url === '/' ? url : url.replace(/\/$/, '');
}

module.exports = withRouter(function CotypeLink({
  router,
  href: someHref,
  ...someRest
}) {
  return createElement(Context, {
    children: ({ basePath }) => {
      const href = absolute(someHref, router.pathname);

      const { as, query, rest } = (href.match(/\/\$[a-z0-9]+/g) || []).reduce(
        (memo, n) => {
          const name = n.replace(/\/\$/, '');

          if (someRest[name]) {
            memo.query.push(`${name}=${someRest[name]}`);
            /* eslint-disable-next-line no-param-reassign */
            memo.as = memo.as.replace(
              new RegExp(`\\/\\$${name}`, 'g'),
              `/${someRest[name]}`,
            );
            /* eslint-disable-next-line no-param-reassign */
            delete memo.rest[name];
          }

          return memo;
        },
        { query: [], rest: { ...someRest }, as: `${basePath}${href}` },
      );

      return createElement(Link, {
        href: `${href}${query.length ? `?${query.join('&')}` : ''}`,
        as,
        ...rest,
      });
    },
  });
});
