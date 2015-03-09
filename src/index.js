import api from './api';

module.exports = (config, log) => {
  const {providerApis, providerConfigs} = config;

  return api(providerApis, providerConfigs, log);
};