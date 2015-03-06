import launch from './launch';
import destroy from './destroy';

import providersInjector from '../providers';

module.exports = (providerApis, providerConfigs) => {
  const providers = providersInjector(providerApis, providerConfigs);

  return {
    providers,
    launch:  cloud => launch(cloud, providers),
    destroy: cloud => destroy(cloud, providers)
  };
};