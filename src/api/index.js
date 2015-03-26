import launch from './launch';
import destroy from './destroy';

// import providersInjector from '../providers';

module.exports = (providers, providerConfigs, log, request, proxies) => {
  // const providers = providersInjector(providers, providerConfigs);

  return {
    providers,
    launch:  (cloud, launchLog)  => launch (cloud, providers, launchLog  || log, request, proxies),
    destroy: (cloud, destroyLog) => destroy(cloud, providers, destroyLog || log)
  };
};