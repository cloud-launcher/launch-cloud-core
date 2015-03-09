import launch from './launch';
import destroy from './destroy';

import providersInjector from '../providers';

module.exports = (providerApis, providerConfigs, log) => {
  const providers = providersInjector(providerApis, providerConfigs);

  return {
    providers,
    launch:  cloud => launch(cloud, providers, log),
    destroy: cloud => destroy(cloud, providers, log)
  };
};