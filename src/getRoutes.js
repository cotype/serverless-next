'use strict';

module.exports = function getRoutes(root) {
  const nextRouting = require('@xiphe/next-routing');

  return nextRouting({ root });
};
