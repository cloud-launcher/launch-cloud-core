"use strict";
var $__launch_45_cloud_45_providers__,
    $__amazon__,
    $__digitalocean__,
    $__google__,
    $__microsoft__,
    $__rackspace__;
var profiles = ($__launch_45_cloud_45_providers__ = require("launch-cloud-providers"), $__launch_45_cloud_45_providers__ && $__launch_45_cloud_45_providers__.__esModule && $__launch_45_cloud_45_providers__ || {default: $__launch_45_cloud_45_providers__}).default;
var amazon = ($__amazon__ = require("./amazon"), $__amazon__ && $__amazon__.__esModule && $__amazon__ || {default: $__amazon__}).default;
var digitalocean = ($__digitalocean__ = require("./digitalocean"), $__digitalocean__ && $__digitalocean__.__esModule && $__digitalocean__ || {default: $__digitalocean__}).default;
var google = ($__google__ = require("./google"), $__google__ && $__google__.__esModule && $__google__ || {default: $__google__}).default;
var microsoft = ($__microsoft__ = require("./microsoft"), $__microsoft__ && $__microsoft__.__esModule && $__microsoft__ || {default: $__microsoft__}).default;
var rackspace = ($__rackspace__ = require("./rackspace"), $__rackspace__ && $__rackspace__.__esModule && $__rackspace__ || {default: $__rackspace__}).default;
module.exports = (function(providerApis, providerConfigs) {
  return [amazon, digitalocean, google, microsoft, rackspace].reduce((function(providers, provider) {
    var $__6 = provider,
        $name = $__6.$name,
        $targets = $__6.$targets,
        $dashboardUrl = $__6.$dashboardUrl,
        $credentialSchema = $__6.$credentialSchema,
        credentials = {};
    providers[$name] = {
      api: provider(providerApis[$name], credentials),
      credentialSchema: $credentialSchema,
      credentials: credentials,
      dashboardUrl: $dashboardUrl,
      name: $name,
      profile: profiles[$name],
      targets: $targets,
      $rawAPI: providerApis[$name]
    };
    return providers;
  }), {});
});

//# sourceMappingURL=../providers/index.js.map