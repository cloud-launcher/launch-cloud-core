var generators = require('generator-trees').g;

module.exports = (cloud, providers, log) => {
  return {launch};

  function launch() {
    log('Launching Cloud');

    return validateCloud(cloud, providers, log)
            .then(generatePlan)
            .then(executePlan);
  }

  function validateCloud(cloud, providers, log) {
    log('Validating Cloud Description', cloudDescription);

    const {
      domain,
      root,
      authorizations,
      locations,
      configuration,
      roles,
      containers
    } = cloudDescription;

    return validateDomain(cloudDescription)
            .then(validateRoot)
            .then(validateAuthorizations)
            .then(validateLocations)
            .then(validateContainers)
            .then(validateRoles)
            .then(validateConfiguration)
            .then(() => { return cloudDescription; });

    function validateDomain() {
      log('Validating Domain');

      return new Promise((resolve, reject) => {
        resolve();
      });
    }

    function validateRoot() {
      log('Validating Root');

      return new Promise((resolve, reject) => {
        resolve();
      });
    }

    function validateAuthorizations() {
      log('Validating Authorizations');

      return new Promise((resolve, reject) => {
        resolve();
      });
    }

    function validateLocations() {
      log('Validating Locations');

      return new Promise((resolve, reject) => {
        _.each(locations, (locations, providerName) => {
          const provider = providers[providerName];

          if (!provider) reject(new Error(['No provider with name', providerName].join(' ')));

          _.each(locations, location => {
            if (!_.contains(provider.$locations, location)) reject(new Error(['Provider', providerName, 'has no location', location].join(' ')));
          });
        });

        resolve();
      });
    }

    function validateContainers() {
      log('Validating Containers');

      return Promise
                .all(_.map(containers, (containerDescription, name) => {
                  const [namespace, image] = containerDescription.container.split('/'),
                        [repository, tag] = image.split(':');

                  return checkDockerRegistry(namespace, repository, tag);
                }));

      function checkDockerRegistry(namespace, repository, tag) {
        tag = tag || 'latest';
        const url = `https://registry.hub.docker.com/v1/repositories/${namespace}/${repository}/tags/${tag}`;
        // log(`Looking for container ${namespace}/${repository}:${tag} at ${url}`);
        return new Promise((resolve, reject) => {
          request(url, (error, response, body) => {
            if (error) reject(new Error(['Error checking Docker registry', error].join(' ')));
            else {
              if (response.statusCode === 200) {
                log(`Found ${namespace}/${repository}:${tag}`);
                resolve();
              }
              else reject(new Error(`Did not find ${namespace}/${repository}:${tag} on Docker registry!`));
            }
          });
        });
      }
    }

    function validateRoles() {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }

    function validateConfiguration() {
      return new Promise((resolve, reject) => {
        resolve();
      });
    }
  }

  function machineGenerator() {
    // clusterMachineGenerators = _.map();
    return generators.loopUntilEmpty(clusterMachineGenerators);
  }

  function generatePlan(config) {
    log('Generating Launch Plan', config);

    return new Promise((resolve, reject) => {
      log('resolving generatePlan', config);

      resolve({plan: 'a plan'});

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
    });
  }

  function executePlan(plan) {
    log('Executing Launch Plan', plan);

    return new Promise((resolve, reject) => {
      launchClusters(plan).then(resolve, reject);
    });
  }

  function launchClusters(plan) {
    _.each(plan.locations, (locations, providerName) => {
      var provider = providers[providerName];
      _.each(locations, location => {

      });
    });
    var api = acquireProviderAPI(),
        machine = launchMachine(api);

  }

  function launchMachine(api) {

  }
};

function processConcurrently(generator, processorConstructor, concurrencyCount) {
  return new Promise((resolve, reject) => {
    var processors = createProcessors();

    g.map(processors, processor => {
//      processor.
    });

    launchMachine(machine);

    function createProcessors() {
      return g.toArray(g.map(g.repeat(processorConstructor, concurrencyCount), constructor => constructor()));
    }

    function acquireProcessor() {
      return processors.unshift();
    }

    function returnProcessor(processor) {
      processors.shift(processor);
    }
  });

}


// function* generator(q) {
//   var next = 0;

//   q.onRemoved(index => {
//     if (next > index) {
//       next = next == 0 ? q.length - 1 : next - 1;
//     }
//   });

//   q.onAdded(index => {
//     if (index <= next) {
//       //next =
//     }
//   });

//   while (q.length > 0) {
//     yield q[next];
//     next = (next + 1) % q.length;
//   }
// }

// for (var result of generator(q)) {
//   if (result.done) remove this generator;
//   else yield result;
// }



// cloudSchema = {
//   domain: '',
//   locations: {providerName: [locations]},
//   configuration: {roleName: machineCount},
//   defaultSize: {roleName: 'machineSize' || roleName: {providerName: 'machineSize'}},
//   roles: {roleName: roleDefinition},
//   containers: {containerName: containerDefinition}
// }


// manifest = {
//   locations: [{
//     id: ''
//     name: ''
//     provider: '',

//     machines: [{
//       id,
//       location: 'location',
//       size: '',
//       image: '',
//       keys: [],
//       userData: 'cloud-config goes here'
//     }]
//   }]
// }


let manifest = {
  locations: [{
    id: '',
    name: '',
    provider: '',
    machines: ['machineID']
  }],
  debug: {

  }
};
