import _ from 'lodash';
import gt from 'generator-trees';
import templates from '../templates';

var fs = require('fs');

// var templates = require('../templates');

const {g, p} = gt;

module.exports = (plan, providers, log) => {
  log = ((log) => arg => { log(arg); return arg; })(log);

  const type = 'Execute';

  console.log(plan);

  const {
    cloudID,
    definition,
    clusters
  } = plan;

  function start(name, ...args) {
    return log({type, start: name, args});
  }

  function ok(name, ...args) {
    return log({type, ok: name, args});
  }

  function bad(name, ...args) {
    return log({type, bad: name, args});
  }

  return launch();

  function launch() {
    console.log(plan);

    return new Promise((resolve, reject) => {
      start('Plan');

      const clustersByProvider = _.groupBy(plan.clusters, cluster => { return cluster.providerName; });

      console.log('clustersByProvider', clustersByProvider);

      const launchPromise =
        Promise.all(_.map(clustersByProvider, launchProviderClusters))
                .then(providerClusters => {
                  console.log('providerClusters', providerClusters);

                  const clusters = _.reduce(providerClusters, (result, clusters) => {
                      _.each(clusters, (cluster, id) => {
                        result[id] = cluster;
                        cluster.machineCount = _.keys(cluster.machines).length;
                      });

                      return result;
                    }, {});

                  const cloud = {
                    id: cloudID,
                    clusters,
                    clusterCount: _.keys(clusters).length
                  };

                  ok('Plan', {cloud});
                  resolve(cloud);
                });

      launchPromise.catch(error => {
        reject(bad('Plan', {error}));
      });

      return launchPromise;
    });
  }

  function launchProviderClusters(clusters, providerName) {
    console.log('clusters', clusters);
    return new Promise((resolve, reject) => {
      const provider = providers[providerName],
            launchedClusters = _.reduce(clusters, (result, cluster) => {
              const {id, location, discoveryURL} = cluster;

              result[id] = {
                id,
                discoveryURL,
                location,
                machines: {},
                provider: providerName
              };

              return result;
            }, {});

      start('Provider', {providerName});

      p.async(
        provider.api.MAX_CONCURRENT_CALLS,
        g.map(
          g.interleave(
            g.map(g.toGenerator(clusters), cluster => cluster.machineGenerator())
          ),
          machineDef => new Promise((resolve, reject) => {
            const {id, roleName, cluster, generatedAt} = machineDef,
                  {id: clusterID, location, providerName, discoveryURL} = cluster;

            const size = '512mb',
                  image = 'coreos-stable';

            const files = getFiles(id, roleName),
                  metadata = _.map({id, clusterID, provider: providerName, location, size, image, roleName, generatedAt}, (value, key) => `${key}=${value}`).join(','),
                  userData = templates.cloudConfig.render({discoveryURL, metadata, files});

            const machine = {
              id,
              clusterID,
              provider: providerName,
              location,
              size,
              image,
              roleName,
              keys: definition.authorizations,
              generatedAt,
              userData
            };

            start('Machine', {machine});

            // ok('Machine', {machine});
            // resolve(machine);

            provider
              .api
              .createMachine(machine)
              .then(
                response => {
                  machine.response = response;
                  ok('Machine', {machine, machineDef});
                  resolve(machine);
                },
                error => reject(bad('Machine', {machine, machineDef, error}))
              );
          })),
        (machine, machinesGeneratedSoFar) => {
          launchedClusters[machine.clusterID].machines[machine.id] = _.pick(machine, ['size', 'image', 'roleName', 'generatedAt', 'response', 'id']);

          console.log(machinesGeneratedSoFar, machine);
        }
      )
      .then(
        count => {
          ok('Provider', {providerName});
          resolve(launchedClusters);
        },
        error => reject(bad('Provider', {providerName, error}))
      );
    });
  }

  function getFiles(id, roleName) {
    const containerNames = definition.roles[roleName];

    console.log('containerNames', containerNames, definition, roleName);

    const bootstrap = {
      path: '/home/core/bootstrap.sh',
      owner: 'core',
      permissions: '0700',
      content: indent(templates.bootstrap.render({
        services: _.map(containerNames, containerName => {
            let isGlobal = _.contains(definition.roles.$all || [], containerName);

            containerName = containerName + (isGlobal ? '' : '@');

            return {
              fileName: `${containerName}.service`,
              name: `${containerName}${isGlobal ? '' : id}`
            };
          })
        }),
      '      ')
    };

    var util = {
      path: '/home/core/util.sh',
      owner: 'core',
      permissiosn: '0700',
      content: indent(templates.util_sh, '      ')
    };

    return [bootstrap, util].concat(_.map(containerNames, containerName => makeFileRecord(roleName, containerName)));
  }

  function makeFileRecord(roleName, containerName) {
    console.log('makeFileRecord', roleName, containerName);
    let isGlobal = _.contains(definition.roles.$all || [], containerName),
        template = isGlobal ? templates.containerService : templates['container@Service'],
        serviceName = containerName + (isGlobal ? '' : '@'),
        container = definition.containers[containerName] || {},
        options = container.options;


    if (containerName === 'cadvisor') options = '-v /:/rootfs:ro -v /var/run:/var/run:rw -v /sys:/sys:ro -v /var/lib/docker:/var/lib/docker:ro -p 8080:8080';

    // fix these names!
    containerName = getQualifiedContainerName(containerName);

    const service = {
      name: containerName,
      content: template.render({
        serviceName,
        containerName,
        statsContainerName: containerName.replace('/', '_'),
        roleName,
        options,
        isGlobal
      })
    };

    return {
      path: '/home/core/' + serviceName + '.service',
      owner: 'core',
      permissions: '0600',
      content: indent(service.content, '      ')
    };
  }

  function getQualifiedContainerName(containerName) {
    if (containerName === 'cadvisor') return 'google/cadvisor';

    if (!definition.containers) return containerName;

    const container = definition.containers[containerName];

    if (!container) return containerName;

    return container.container || containerName;
  }
};

function indent(s, i) {
  return s.replace(/^/gm, i);
}