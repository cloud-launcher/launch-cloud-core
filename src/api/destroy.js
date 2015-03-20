import cloud from '../cloud/cloud';

module.exports =
  (cloudDescription, providers, log) =>
  cloud(cloudDescription, providers, log).destroy();