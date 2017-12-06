"use strict";
var _ = require('lodash');
module.exports = (function(provider, log, concurrentLaunches) {
  var launches = {
    inProgress: 0,
    next: 0
  },
      availableProviders = [];
  concurrentLaunches = concurrentLaunches || 10;
  for (var i = 0; i < concurrentLaunches; i++)
    availableProviders.push(provider);
  return {launch: launch};
  function launch(machines, progress) {
    return new Promise((function(launchResolve, reject) {
      var $__0 = $traceurRuntime.initGeneratorFunction(assignToProviders);
      var q = machines();
      launchMachines();
      function launchMachines() {
        if (machines.remaining === 0) {
          if (availableProviders.length == concurrentLaunches)
            return launchResolve(machines);
          else {
            qLaunch();
            return ;
          }
        }
        var takeCount = Math.min(availableProviders.length, q.length);
        if (takeCount > 0)
          assignToProviders(takeCount);
      }
      function qLaunch() {
        setTimeout(launchMachines, 0);
      }
      function assignToProviders(takeCount) {
        return $traceurRuntime.createGeneratorInstance(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                $ctx.returnValue = map(zip(toGenerator(take(integers, takeCount), take(machines, takeCount), take(availableProviders, takeCount))), (function(pair) {
                  var index = pair[0],
                      machine = pair[1],
                      provider = pair[2];
                  return {
                    remaining: takeCount - index,
                    promise: new Promise((function(resolve, reject) {
                      launch(machine, provider).then((function(result) {
                        var response = result.response,
                            provider = result.provider;
                        availableProviders.push(provider);
                        machine.providerResponse = response;
                        resolve(machine);
                      }), (function(error) {
                        var provider = error.provider;
                        availableProviders.push(provider);
                        reject(error, machine);
                      }));
                    }))
                  };
                }));
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, $__0, this);
      }
      function launch(machine, provider) {
        return new Promise((function(resolve, reject) {
          provider.createMachine(machine).then((function(response) {
            return resolve({
              response: response,
              provider: provider
            });
          }), (function(error) {
            return reject({
              error: error,
              provider: provider
            });
          }));
        }));
      }
    }));
  }
});
module.exports.name = 'digitalocean';

//# sourceMappingURL=machineLauncher.js.map