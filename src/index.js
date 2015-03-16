import api from './api';

import traceurRuntime from './traceur-runtime';

module.exports = config => {
  const {
    providerApis,
    providerConfigs,
    log,
    request,
    proxies
  } = config;

  return api(providerApis, providerConfigs, log, request, proxies);
};