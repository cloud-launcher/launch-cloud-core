import expand from './expand';
import validate from './validate';

import cloudConfig from '../bootstrapers/cloudConfig';

import _ from 'lodash';

var generators = require('generator-trees').g;

const dockerHubApiRoot = 'https://registry.hub.docker.com';

module.exports = (cloud, providers, log, request, dockerHubApiRoot) => {
  console.log(cloudConfig);

  return {launch};

  function launch() {
    log('Launching Cloud');

    return expand(cloud)
            .then(cloud => validate(cloud, providers, log, request, dockerHubApiRoot))
            .then(generatePlan)
            .then(executePlan);
  }

  function generatePlan(config) {
    log('Generating Launch Plan');

    return new Promise((resolve, reject) => {
      log('resolving generatePlan');

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
    log('Executing Launch Plan');

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

  function machineGenerator() {
    // clusterMachineGenerators = _.map();
    return generators.loopUntilEmpty(clusterMachineGenerators);
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
