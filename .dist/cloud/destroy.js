"use strict";
var $__buildLog__,
    $__lodash__,
    $__generator_45_trees__;
var buildLog = ($__buildLog__ = require("./buildLog"), $__buildLog__ && $__buildLog__.__esModule && $__buildLog__ || {default: $__buildLog__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var gt = ($__generator_45_trees__ = require("generator-trees"), $__generator_45_trees__ && $__generator_45_trees__.__esModule && $__generator_45_trees__ || {default: $__generator_45_trees__}).default;
var $__3 = gt,
    g = $__3.g,
    p = $__3.p;
module.exports = (function(cloud, providers, logFn) {
  var $__4 = buildLog(logFn, 'Destroy'),
      log = $__4.log,
      start = $__4.start,
      ok = $__4.ok,
      bad = $__4.bad;
  var $__5 = cloud,
      id = $__5.id,
      clusters = $__5.clusters;
  return destroy(cloud);
  function destroy(cloud) {
    start('Cloud', {cloud: cloud});
    var clustersByProvider = _.groupBy(clusters, (function(cluster) {
      return cluster.provider;
    }));
    var destroyPromise = Promise.all(_.map(clustersByProvider, destroyProviderClusters)).then((function(clusters) {
      ok('Cloud', {cloud: cloud});
      return cloud;
    }));
    destroyPromise.catch((function(error) {
      bad('Cloud', {error: error});
    }));
    return destroyPromise;
  }
  function destroyProviderClusters(clusters, providerName) {
    return new Promise((function(resolve, reject) {
      var provider = providers[providerName];
      p.async(provider.api.MAX_CONCURRENT_CALLS, g.map(g.interleave(g.map(g.toGenerator(clusters), (function(cluster) {
        return g.toGenerator(_.map(cluster.machines, (function(machine, id) {
          return machine;
        })));
      }))), (function(machine) {
        return new Promise((function(resolve, reject) {
          start('Machine', {machine: machine});
          provider.api.destroyMachine(machine).then((function(response) {
            ok('Machine', {
              machine: machine,
              response: response
            });
            resolve(machine);
          }), (function(error) {
            return reject(bad('Machine', {
              machine: machine,
              error: error
            }));
          }));
        }));
      })), (function(machine, machinesDestroyedSoFar) {
        log('destroyed', machine, machinesDestroyedSoFar);
      })).then((function(count) {
        resolve(count);
      }), (function(error) {
        return reject(bad('Cloud', {
          providerName: providerName,
          error: error
        }));
      }));
    }));
  }
});

//# sourceMappingURL=../cloud/destroy.js.map