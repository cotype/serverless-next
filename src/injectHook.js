'use strict';

module.exports = function injectHook(serverless, plugin, hooks, before, after) {
  hooks.forEach((hook) => {
    const original = plugin.hooks[hook];
    /* eslint-disable-next-line no-param-reassign */
    plugin.hooks[hook] = async () => {
      await before(serverless, plugin);
      await original();
      await after(serverless, plugin);
    };
  });
};
