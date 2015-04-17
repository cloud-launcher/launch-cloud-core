import buildLog from './buildLog';

import templates from '../templates';

import _ from 'lodash';
import gt from 'generator-trees';

var fs = require('fs');

const {g, p} = gt;

module.exports = (plan, providers, logFn) => {
  const {log, start, ok, bad} = buildLog(logFn, 'Execute');

  const {
    cloudID,
    definition,
    clusters
  } = plan;

  return launch();

  function launch() {
    return new Promise((resolve, reject) => {
      start('Plan');

      const clustersByProvider = _.groupBy(plan.clusters, cluster => { return cluster.providerName; });

      const launchPromise =
        Promise
          .all(_.map(clustersByProvider, launchProviderClusters))
          .then(providerClusters => {
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
              clusterCount: _.keys(clusters).length,
              definition: definition
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

            provider
              .api
              .createMachine(machine)
              .then(
                response => {
                  machine.response = response;
                  machine.providerData = response;
                  ok('Machine', {machine, machineDef});
                  resolve(machine);
                },
                error => reject(bad('Machine', {machine, machineDef, error}))
              );
          })),
        (machine, machinesGeneratedSoFar) => {
          launchedClusters[machine.clusterID].machines[machine.id] = _.pick(machine, ['size', 'image', 'roleName', 'generatedAt', 'response', 'id', 'providerData']);
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

    const bootstrap = {
      path: '/home/core/bootstrap.sh',
      owner: 'core',
      permissions: '0700',
      content: indent(templates.bootstrap.render({
        services: _.map(containerNames, getServices)
      }),
      '      ')
    };

    var util = {
      path: '/home/core/util.sh',
      owner: 'core',
      permissiosn: '0700',
      content: indent(templates.util_sh, '      ')
    };

    return [
      bootstrap,
      util
    ].concat(_.map(containerNames, makeFileRecord));

    function getServices(containerName) {
      let isGlobal = _.contains(definition.roles.$all || [], containerName);

      containerName = containerName + (isGlobal ? '' : '@');

      return {
        fileName: `${containerName}.service`,
        name: `${containerName}${isGlobal ? '' : id}`
      };
    }

    function makeFileRecord(containerName) {
      let isGlobal = _.contains(definition.roles.$all || [], containerName),
          template = isGlobal ? templates.containerService : templates['container@Service'],
          serviceName = containerName + (isGlobal ? '' : '@'),
          container = definition.containers[containerName] || {},
          options = computeOptions(container);

      if (containerName === 'cadvisor' && !options) options = '-v /:/rootfs:ro -v /var/run:/var/run:rw -v /sys:/sys:ro -v /var/lib/docker:/var/lib/docker:ro -p 8080:8080';

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
  }

  function computeOptions(container) {
    if (container.options) return container.options;

    const {environment, ports, volumes} = container;

    return _.compact([
      _.map(environment,  (value, key) => `-e ${key}=${value}`).join(' '),
      _.map(ports,        (from, to) =>   `-p ${to}${from === true ? '' : (':' + from)}`).join(' '),
      _.map(volumes,      (from, to) =>   `-v ${to}${from === true ? '' : (':' + from)}`).join(' ')
    ]).join(' ');
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