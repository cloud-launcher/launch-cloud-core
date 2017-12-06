"use strict";
var $__expand__,
    $__validate__,
    $__generatePlan__,
    $__executePlan__,
    $__destroy__,
    $__lodash__;
var expand = ($__expand__ = require("./expand"), $__expand__ && $__expand__.__esModule && $__expand__ || {default: $__expand__}).default;
var validate = ($__validate__ = require("./validate"), $__validate__ && $__validate__.__esModule && $__validate__ || {default: $__validate__}).default;
var generatePlan = ($__generatePlan__ = require("./generatePlan"), $__generatePlan__ && $__generatePlan__.__esModule && $__generatePlan__ || {default: $__generatePlan__}).default;
var executePlan = ($__executePlan__ = require("./executePlan"), $__executePlan__ && $__executePlan__.__esModule && $__executePlan__ || {default: $__executePlan__}).default;
var destroyCloud = ($__destroy__ = require("./destroy"), $__destroy__ && $__destroy__.__esModule && $__destroy__ || {default: $__destroy__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var dockerHubApiRoot = 'https://registry.hub.docker.com',
    discoveryEtcdApiRoot = 'https://discovery.etcd.io';
module.exports = (function(cloud, providers, log, request, proxies) {
  return {
    launch: launch,
    destroy: destroy
  };
  function launch() {
    return expand(cloud).then((function(cloud) {
      return validate(cloud, providers, log, request, proxies.dockerHubApiRoot || dockerHubApiRoot);
    })).then((function(cloud) {
      return generatePlan(cloud, providers, log, request, proxies.discoveryEtcdApiRoot || discoveryEtcdApiRoot);
    })).then((function(plan) {
      return executePlan(plan, providers, log);
    })).then((function(launchedCloud) {
      return launchedCloud;
    }));
  }
  function destroy() {
    return destroyCloud(cloud, providers, log);
  }
});

//# sourceMappingURL=../cloud/cloud.js.map