'use strict';

module.exports = function retryUploadArtifacts(serverless, plugin) {
  let uploaded = false;
  const originalUploadArtifacts =
    plugin.hooks['after:aws:deploy:deploy:uploadArtifacts'];

  /* eslint-disable-next-line no-param-reassign */
  plugin.hooks['after:aws:deploy:deploy:uploadArtifacts'] = async () => {
    try {
      await originalUploadArtifacts();
      uploaded = true;
    } catch (e) {
      if (e.message === 'The specified bucket does not exist') {
        serverless.cli.log(
          `Bucket ${plugin.getOptions().assetBucketName} does not exist yet...`,
        );
        return;
      }

      throw e;
    }
  };

  /* eslint-disable-next-line no-param-reassign */
  plugin.hooks['after:aws:deploy:deploy:updateStack'] = async () => {
    if (!uploaded) {
      serverless.cli.log('Retrying asset upload...');
      await originalUploadArtifacts();
    }
  };
};
