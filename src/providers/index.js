import profiles from 'launch-cloud-providers';

import amazon from './amazon';
import digitalocean from './digitalocean';
import google from './google';
import microsoft from './microsoft';
import rackspace from './rackspace';

module.exports = (providerApis, providerConfigs) => {
  return [
    amazon,
    digitalocean,
    google,
    microsoft,
    rackspace
  ].reduce((providers, provider) => {
    const {$name, $targets} = provider;
    providerConfigs[$name] = providerConfigs[$name] || {};
    providers[$name] = {
      name: $name,
      profile: profiles[$name],
      targets: $targets,
      api: provider(providerApis[$name], providerConfigs[$name])
    };
    return providers;
  }, {});

  // return {
  //   dummy,
  //   digitalocean: digitalocean(providerApis.digitalocean, providerConfigs.digitalocean)
  // };
};