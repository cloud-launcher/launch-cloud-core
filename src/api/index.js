import launch from './launch';
import destroy from './destroy';
import checkProviderConfigurations from './checkProviderConfigurations';

import providersInjector from '../providers';

module.exports = (providerApis, providerConfigs, log, request, dockerHubApiRoot) => {
  const providers = providersInjector(providerApis, providerConfigs);

  return {
    providers,
    launch:  cloud => launch(cloud, providers, log, request, dockerHubApiRoot),
    destroy: cloud => destroy(cloud, providers, log),
    checkProviderConfigurations: cloud => checkProviderConfigurations(cloud, providers, log)
  };
};