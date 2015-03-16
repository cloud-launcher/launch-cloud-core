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
    const {$name, $targets, $credentialSchema} = provider;
    const credentials = {};
    // providerConfigs[$name] = providerConfigs[$name] || {credentials: {}};
    providers[$name] = {
      name: $name,
      profile: profiles[$name],
      targets: $targets,
      credentialSchema: $credentialSchema,
      credentials,
      api: provider(providerApis[$name], credentials),
      $rawAPI: providerApis[$name]
    };
    return providers;
  }, {});
};