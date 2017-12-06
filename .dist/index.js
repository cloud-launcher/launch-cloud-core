"use strict";
Object.defineProperties(module.exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var $__api__,
    $__traceur_45_runtime__;
var api = ($__api__ = require("./api"), $__api__ && $__api__.__esModule && $__api__ || {default: $__api__}).default;
var traceurRuntime = ($__traceur_45_runtime__ = require("./traceur-runtime"), $__traceur_45_runtime__ && $__traceur_45_runtime__.__esModule && $__traceur_45_runtime__ || {default: $__traceur_45_runtime__}).default;
var $__default = (function($__2) {
  var $__3 = $__2,
      providers = $__3.providers,
      providerConfigs = $__3.providerConfigs,
      log = $__3.log,
      request = $__3.request,
      proxies = $__3.proxies;
  return api(providers, providerConfigs, log, request, proxies);
});

//# sourceMappingURL=index.js.map