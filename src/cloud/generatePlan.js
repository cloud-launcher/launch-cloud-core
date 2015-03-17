import _ from 'lodash';
import uuid from 'uuid';

import gt from 'generator-trees';

const {g, p} = gt;

const MAX_CONCURRENTLY_GENERATED_CLUSTERS = 5;

module.exports = (cloud, providers, log, request, discoveryEtcdApiRoot) => {
  log = ((log) => arg => { log(arg); return arg; })(log);

  const {
    locations,
    configuration
  } = cloud;

  const type = 'Generate Plan';

  function start(name, ...args) {
    return log({type, start: name, args});
  }

  function ok(name, ...args) {
    return log({type, ok: name, args});
  }

  function bad(name, ...args) {
    return log({type, bad: name, args});
  }

  start('Generation');

  return initializePlan()
          .then(defineClusters)
          .then(plan => {
            ok('Generation');
            return plan;
          });

  function initializePlan() {
    return new Promise((resolve, reject) => {
      const plan = {
        cloudID: uuid.v4()
      };

      resolve(plan);
    });
  }

  function defineClusters(plan) {
    return new Promise((resolve, reject) => {
      const clusterArray = _.flatten(_.map(locations, (locations, providerName) => {
        return _.map(locations, location => {
          return {
            id: uuid.v4(),
            providerName,
            location,
            machineCount: _.reduce(configuration, (count, roleCount) => { return count + roleCount; }, 0)
          };
        });
      }));

      const clusters = _.reduce(clusterArray, (clusters, cluster) => {
        clusters[cluster.id] = cluster;
        return clusters;
      }, {});

      const machineCount = _.reduce(clusters, (count, cluster) => count + cluster.machineCount, 0);
      log({type: 'Machines', args: [{machineCount}]});

      start('Clusters', {clusters});

      p.async(
        MAX_CONCURRENTLY_GENERATED_CLUSTERS,
        g.map(g.toGenerator(clusterArray), assignEtcdUrl),
        (cluster, generatedSoFar) => { })
      .then(() => {
        plan.clusters = clusters;
        resolve(clusters);
      }, reject);

      function assignEtcdUrl(cluster) {
        return new Promise((resolve, reject) => {
          start('Cluster', {cluster});
          request(`${discoveryEtcdApiRoot}/new`, (error, response, discoveryURL) => {
            if (error) {
              console.log('Error getting discovery url!');
              reject(bad('Cluster', {error, cluster}));
              return false;
            }

            cluster.discoveryURL = discoveryURL;
            cluster.machineGenerator = getMachineGenerator(cluster);

            ok('Cluster', {cluster});
            resolve(cluster);
          });
        });
      }
    });
  }

  function getMachineGenerator(cluster) {
    return () => g.interleave(
                  g.map(
                    g.toGenerator(_.map(configuration, (value, roleName) => { return [roleName, value]; }))
                    , configuration => {
                      if (typeof value === 'number') {
                        return g.take((function*() {
                          while (true) {
                            yield generateMachine(cluster, roleName);
                          }
                        })(), value);
                      }
                      else throw new Error('Can\'t handle non-number role values yet!');
                    }));
  }

  function generateMachine(cluster, roleName) {
    return {
      id: uuid.v4(),
      roleName,
      cluster
    };
  }
    // log('rejecting generatePlan', config);
    // reject({error: 'rejected'});

    //var manifest = createManifest(config);

    // return {machineGenerator, launch};

    // function machineGenerator() {
    //   clusterMachineGenerators = _.map()
    //   return generators.loopUntilEmpty(clusterMachineGenerators);
    // }

    // function createManifest(definition) {
    //   var containers = definition.containers,
    //       containerManifest = _.map(containers, parseContainer);
    // }

    // function parseContainer(container, name) {
    //   return {
    //     name,
    //     construct: () => {
    //       //return
    //     }
    //   };
    // }
};