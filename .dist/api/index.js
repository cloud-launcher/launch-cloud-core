"use strict";
var $__launch__,
    $__destroy__;
var launch = ($__launch__ = require("./launch"), $__launch__ && $__launch__.__esModule && $__launch__ || {default: $__launch__}).default;
var destroy = ($__destroy__ = require("./destroy"), $__destroy__ && $__destroy__.__esModule && $__destroy__ || {default: $__destroy__}).default;
module.exports = (function(providers, providerConfigs, log, request, proxies) {
  return {
    providers: providers,
    proxies: proxies,
    launch: (function(cloud, launchLog) {
      return launch(cloud, providers, launchLog || log, request, proxies);
    }),
    destroy: (function(cloud, destroyLog) {
      return destroy(cloud, providers, destroyLog || log);
    })
  };
});

//# sourceMappingURL=../api/index.js.map