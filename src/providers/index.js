// Should this directory be pulled out into it's own library? Probably

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
    const {$name, $targets, $dashboardUrl, $credentialSchema} = provider,
          credentials = {};

    providers[$name] = {
      api: provider(providerApis[$name], credentials),
      credentialSchema: $credentialSchema,
      credentials,
      dashboardUrl: $dashboardUrl,
      name: $name,
      profile: profiles[$name],
      targets: $targets,
      $rawAPI: providerApis[$name]
    };

    return providers;
  }, {});
};