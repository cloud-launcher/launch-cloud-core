import api from './api';

module.exports = config => {
  const {
    providerApis,
    providerConfigs,
    log,
    request,
    dockerHubApiRoot
  } = config;

  return api(providerApis, providerConfigs, log, request, dockerHubApiRoot);
};