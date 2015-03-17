import _ from 'lodash';
import gt from 'generator-trees';
import templates from '../templates';

const {g, p} = gt;

module.exports = (plan, providers, log) => {
  log = ((log) => arg => { log(arg); return arg; })(log);

  const type = 'Execute Plan';

  const {
    cloud,
    clusters
  } = plan;

  const {definition} = cloud;

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
      start('Launching');

      const clustersByProvider = _.groupBy(plan, cluster => { return cluster.providerName; });

      console.log(clustersByProvider);

      const launchPromise =
        Promise.all(_.map(clustersByProvider, launchProviderClusters))
                .then(() => {
                  ok('Launching');
                  resolve();
                });

      launchPromise.catch(error => {
        reject(bad('Launching', {error}));
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
                              {id: clusterID, location, providerName} = cluster;

                        const size = '512mb',
                              image = 'coreos-alpha';

                        const machine = {
                          machineID,
                          location,
                          size,
                          image,
                          keys
                        };

                        const metadata = _.map(machine, (value, key) => `${key}=${value}`).join(',');

                        machine.userData = templates.cloudConfig.render({discoveryURL, metadata, files});

                        start('Machine', {machine});

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
          containerNames = description.roles[roleName];

    const bootstrap = {
      path: '/home/core/bootstrap.sh',
      owner: 'core',
      permissions: '0700',
      content: indent(templates.bootstrap.render({
        services: _.map(containerNames, containerName => {
            return {
              fileName: `${containerName}.service`,
              name: `${containerName}${containerName.indexOf('@') >= 0 ? id : ''}`
            };
          })
        }),
      '      ')
    };

    var util = {
      path: '/home/core/util.sh',
      owner: 'core',
      permissiosn: '0700',
      content: indent()
    };

    return [bootstrap, util].concat(_.map(containerNames, makeFileRecord));
  }

  function makeFileRecord(containerName) {
    var service = {
      name: containerName,
      content: templates.containerService.render({serviceName, containerName, roleName})
    };

    if (!service) {
      log(containerName, 'not found!');
    }

    return {
      path: '/home/core/' + containerName + '.service',
      owner: 'core',
      permissions: '0600',
      content: indent(service.content, '      ')
    };
  }
};

function indent(s, i) {
  return s.replace(/^/gm, i);
}