import launch from './launch';
import destroy from './destroy';

import providersInjector from '../providers';

module.exports = (providerApis, providerConfigs, log, request, dockerHubApiRoot) => {
  const providers = providersInjector(providerApis, providerConfigs);

  return {
    providers,
    launch:  (cloud, launchLog) => launch(cloud, providers, launchLog || log, request, dockerHubApiRoot),
    destroy: cloud => destroy(cloud, providers, log)
  };
};