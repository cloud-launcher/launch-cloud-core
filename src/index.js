import api from './api';

import traceurRuntime from './traceur-runtime';

export default
  ({providers, providerConfigs, log, request, proxies}) =>
  api(provider, providerConfigs, log, request, proxies);