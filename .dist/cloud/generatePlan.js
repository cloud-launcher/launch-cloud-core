"use strict";
var $__lodash__,
    $__uuid__,
    $__buildLog__,
    $__generator_45_trees__;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var uuid = ($__uuid__ = require("uuid"), $__uuid__ && $__uuid__.__esModule && $__uuid__ || {default: $__uuid__}).default;
var buildLog = ($__buildLog__ = require("./buildLog"), $__buildLog__ && $__buildLog__.__esModule && $__buildLog__ || {default: $__buildLog__}).default;
var gt = ($__generator_45_trees__ = require("generator-trees"), $__generator_45_trees__ && $__generator_45_trees__.__esModule && $__generator_45_trees__ || {default: $__generator_45_trees__}).default;
var $__4 = gt,
    g = $__4.g,
    p = $__4.p;
var MAX_CONCURRENTLY_GENERATED_CLUSTERS = 5;
module.exports = (function(cloud, providers, logFn, request, discoveryEtcdApiRoot) {
  var $__5 = buildLog(logFn, 'Generate'),
      log = $__5.log,
      start = $__5.start,
      ok = $__5.ok,
      bad = $__5.bad;
  var $__6 = cloud,
      locations = $__6.locations,
      configuration = $__6.configuration;
  start('Plan');
  var promise = initializePlan().then(defineClusters).then((function(plan) {
    ok('Plan', {plan: plan});
    return plan;
  }));
  promise.catch((function(error) {
    return bad('Plan', {error: error});
  }));
  return promise;
  function initializePlan() {
    return new Promise((function(resolve, reject) {
      var plan = {
        cloudID: uuid.v4(),
        definition: cloud
      };
      resolve(plan);
    }));
  }
  function defineClusters(plan) {
    return new Promise((function(resolve, reject) {
      var clusterArray = _.flatten(_.map(locations, (function(locations, providerName) {
        return _.map(locations, (function(location) {
          return {
            id: uuid.v4(),
            providerName: providerName,
            location: location,
            machineCount: _.reduce(configuration, (function(count, roleCount) {
              return count + roleCount;
            }), 0)
          };
        }));
      })));
      var clusters = _.reduce(clusterArray, (function(clusters, cluster) {
        clusters[cluster.id] = cluster;
        return clusters;
      }), {});
      var machineCount = _.reduce(clusters, (function(count, cluster) {
        return count + cluster.machineCount;
      }), 0);
      log({
        type: 'Machines',
        args: [{machineCount: machineCount}]
      });
      start('Clusters', {clusters: clusters});
      p.async(MAX_CONCURRENTLY_GENERATED_CLUSTERS, g.map(g.toGenerator(clusterArray), assignEtcdUrl), (function(cluster, generatedSoFar) {})).then((function() {
        plan.clusters = clusters;
        ok('Clusters', {clusters: clusters});
        resolve(plan);
      }), reject);
      function assignEtcdUrl(cluster) {
        return new Promise((function(resolve, reject) {
          start('Cluster', {cluster: cluster});
          request((discoveryEtcdApiRoot + "/new"), (function(error, response, discoveryURL) {
            if (error) {
              reject(bad('Cluster', {
                error: error,
                cluster: cluster
              }));
              return false;
            }
            cluster.discoveryURL = discoveryURL;
            cluster.machineGenerator = getMachineGenerator(cluster);
            ok('Cluster', {cluster: cluster});
            resolve(plan);
          }));
        }));
      }
    }));
  }
  function getMachineGenerator(cluster) {
    return (function() {
      return g.interleave(g.map(g.toGenerator(_.map(configuration, (function(value, roleName) {
        return [roleName, value];
      }))), (function(configuration) {
        var $__8,
            $__9;
        var $__7 = configuration,
            roleName = ($__8 = $__7[$traceurRuntime.toProperty(Symbol.iterator)](), ($__9 = $__8.next()).done ? void 0 : $__9.value),
            value = ($__9 = $__8.next()).done ? void 0 : $__9.value;
        if (typeof value === 'number') {
          return g.take(($traceurRuntime.initGeneratorFunction(function $__10() {
            return $traceurRuntime.createGeneratorInstance(function($ctx) {
              while (true)
                switch ($ctx.state) {
                  case 0:
                    $ctx.state = (true) ? 1 : -2;
                    break;
                  case 1:
                    $ctx.state = 2;
                    return generateMachine(cluster, roleName);
                  case 2:
                    $ctx.maybeThrow();
                    $ctx.state = 0;
                    break;
                  default:
                    return $ctx.end();
                }
            }, $__10, this);
          }))(), value);
        } else
          throw new Error('Can\'t handle non-number role values yet!');
      })));
    });
  }
  function generateMachine(cluster, roleName) {
    return {
      id: uuid.v4(),
      roleName: roleName,
      cluster: cluster,
      generatedAt: new Date()
    };
  }
});

//# sourceMappingURL=../cloud/generatePlan.js.map