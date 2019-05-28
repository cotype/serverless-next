'use strict';

module.exports = function mutateNextFunctions(serverless, plugin) {
  const { basePath } = plugin.getOptions();
  Object.values(serverless.service.functions).forEach((funct) => {
    if (!funct.handler.match(/^sls-next-build\//)) {
      return;
    }

    funct.events.forEach(({ http }) => {
      /* eslint-disable-next-line no-param-reassign */
      http.path = `${basePath}${http.path}`;
    });
  });
};
