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
                .then(() => {
                  ok('Plan');
                  resolve();
                });

      launchPromise.catch(error => {
        reject(bad('Plan', {error}));
      });

      return launchPromise;
    });
  }

  function launchProviderClusters(clusters, providerName) {
    const provider = providers[providerName];

    return p.async(provider.api.MAX_CONCURRENT_CALLS,
                    g.map(
                      g.interleave(
                        g.map(
                          g.toGenerator(clusters),
                          cluster => cluster.machineGenerator())),
                      machineDef => new Promise((resolve, reject) => {
                        const {id: machineID, roleName, cluster} = machineDef,
                              {id: clusterID, location, providerName, discoveryURL} = cluster;

                        const size = '512mb',
                              image = 'coreos-stable';

                        const machine = {
                          id: machineID,
                          location,
                          size,
                          image,
                          roleName,
                          keys: definition.authorizations
                        };

                        console.log('machine', machineDef, machine);

                        const files = getFiles(machine);


                        const metadata = _.map(machine, (value, key) => `${key}=${value}`).join(',');

                        machine.userData = templates.cloudConfig.render({discoveryURL, metadata, files});

                        start('Machine', {machine});

                        // ok('Machine', {machineDef});
                        // resolve(machine);

                        provider
                          .api
                          .createMachine(machine)
                          .then(response => {
                            ok('Machine', {machine, machineDef});
                            resolve(machine);
                          })
                          .catch(reject);
                      })),
                    (machine, machinesGeneratedSoFar) => {
                      console.log(machinesGeneratedSoFar, machine);
                    });
  }

  function getFiles(machine) {
    const {id, roleName} = machine,
          containerNames = definition.roles[roleName];

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
        options = '';


    if (containerName === 'cadvisor') options = '-v /:/rootfs:ro -v /var/run:/var/run:rw -v /sys:/sys:ro -v /var/lib/docker:/var/lib/docker:ro -p 8080:8080';

    // fix these names!
    containerName = getQualifiedContainerName(containerName);

    const service = {
      name: containerName,
      content: template.render({
        serviceName,
        containerName,
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