/* eslint-disable no-param-reassign */

'use strict';

module.exports = function mutateNextFunctions(serverless, plugin) {
  const { basePath } = plugin.getOptions();
  Object.values(serverless.service.functions).forEach((funct) => {
    if (!funct.handler.match(/^sls-next-build\//)) {
      return;
    }

    funct.environment = {
      ...funct.environment,
      BASE_PATH: `/${serverless.service.provider.stage}`,
      NEXT_BASE_PATH: basePath,
    };
    funct.events.forEach(({ http }) => {
      http.path = `${basePath}${http.path}`;
    });
  });
};
