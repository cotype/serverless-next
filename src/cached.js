'use strict';

module.exports = function cached(factory) {
  const cchd = (a, b, c) => {
    if (!cchd.cache) {
      cchd.cache = factory(a, b, c);
    }

    return cchd.cache;
  };

  return cchd;
};
