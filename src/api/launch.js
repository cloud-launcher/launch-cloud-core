import cloud from '../cloud';

module.exports =
  (cloudDescription, providers, log) => cloud(cloudDescription, providers, log).launch();