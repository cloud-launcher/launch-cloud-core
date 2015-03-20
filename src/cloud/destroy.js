import _ from 'lodash';
import gt from 'generator-trees';

const {g, p} = gt;

module.exports = (cloud, providers, log) => {
  log = ((log) => arg => { log(arg); return arg; })(log);

  const type = 'Destroy';

  console.log(cloud);

  const {
    id,
    clusters
  } = cloud;

  function start(name, ...args) {
    return log({type, start: name, args});
  }

  function ok(name, ...args) {
    return log({type, ok: name, args});
  }

  function bad(name, ...args) {
    return log({type, bad: name, args});
  }

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