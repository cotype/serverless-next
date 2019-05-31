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

module.exports = withRouter(function CotypeLink({ router, href, as, ...rest }) {
  return createElement(Context, {
    children: ({ basePath }) => {
      if (as || !href || !basePath || !href.match(/^(\/|\.)/)) {
        return createElement(Link, {
          href,
          as,
          ...rest,
        });
      }

      if (href.match(/^\//)) {
        return createElement(Link, {
          href,
          ...rest,
          as: `${basePath}${href}`,
        });
      }

      return createElement(Link, {
        ...rest,
        href: absolute(href, router.pathname),
        as: absolute(href, `${basePath}${router.pathname}`),
      });
    },
  });
});
