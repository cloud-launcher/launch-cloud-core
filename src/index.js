import api from './api';

import traceurRuntime from './traceur-runtime';

module.exports = config => {
  const {
    providers,
    providerConfigs,
    log,
    request,
    proxies
  } = config;

  return api(providers, providerConfigs, log, request, proxies);
};