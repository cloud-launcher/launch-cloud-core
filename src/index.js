import api from './api';

module.exports = config => {
  const {providerApis, providerConfigs} = config;

  return api(providerApis, providerConfigs);
};