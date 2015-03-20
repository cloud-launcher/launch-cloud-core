import launch from './launch';
import destroy from './destroy';

import providersInjector from '../providers';

module.exports = (providerApis, providerConfigs, log, request, proxies) => {
  const providers = providersInjector(providerApis, providerConfigs);

  return {
    providers,
    launch:  (cloud, launchLog)  => launch (cloud, providers, launchLog  || log, request, proxies),
    destroy: (cloud, destroyLog) => destroy(cloud, providers, destroyLog || log)
  };
};