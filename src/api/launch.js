import cloud from '../cloud/cloud';

module.exports =
  (cloudDescription, providers, log, request, dockerHubApiRoot) =>
  cloud(cloudDescription, providers, log, request, dockerHubApiRoot).launch();