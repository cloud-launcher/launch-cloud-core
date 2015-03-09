import api from './api';

module.exports = (config, log, request, dockerHubApiRoot) => {
  const {providerApis, providerConfigs} = config;

  return api(providerApis, providerConfigs, log, request, dockerHubApiRoot);
};