import buildLog from './buildLog';

import _ from 'lodash';
import gt from 'generator-trees';

const {g, p} = gt;

module.exports = (cloud, providers, logFn) => {
  const {log, start, ok, bad} = buildLog(logFn, 'Destroy');

  const {
    id,
    clusters
  } = cloud;

  return destroy(cloud);

  function destroy(cloud) {
    start('Cloud', {cloud});

    const clustersByProvider = _.groupBy(clusters, cluster => { return cluster.provider; });

    const destroyPromise = Promise.all(_.map(clustersByProvider, destroyProviderClusters))
      .then(clusters => {
        ok('Cloud', {cloud});
        return cloud;
      });

    destroyPromise.catch(error => {
      bad('Cloud', {error});
    });

    return destroyPromise;
  }

  function destroyProviderClusters(clusters, providerName) {
    return new Promise((resolve, reject) => {
      const provider = providers[providerName];
console.log('clusters', clusters);
      p.async(
          provider.api.MAX_CONCURRENT_CALLS,
          g.map(
            g.interleave(
              g.map(
                g.toGenerator(clusters),
                cluster =>
                  g.toGenerator(
                    _.map(cluster.machines,
                          (machine, id) => {console.log(machine, id); return machine; })))
            ),
            machine => new Promise((resolve, reject) => {
              start('Machine', {machine});

              provider
                .api
                .destroyMachine(machine)
                .then(
                  response => {
                    ok('Machine', {machine, response});
                    resolve(machine);
                  },
                  error => reject(bad('Machine', {machine, error}))
                );
            })
          ),
          (machine, machinesDestroyedSoFar) => {
            console.log('destroyed', machine, machinesDestroyedSoFar);
          }
        )
        .then(
          count => {
            resolve(count);
          },
          error => reject(bad('Cloud', {providerName, error}))
        );
    });
  }
};