import expand from './expand';
import validate from './validate';
import generatePlan from './generatePlan';
import executePlan from './executePlan';

import _ from 'lodash';

var generators = require('generator-trees').g;

const dockerHubApiRoot = 'https://registry.hub.docker.com',
      discoveryEtcdApiRoot = 'https://discovery.etcd.io';

module.exports = (cloud, providers, log, request, proxies) => {
  return {launch};

  function launch() {
    return expand(cloud)
            .then(cloud => validate(cloud, providers, log, request, proxies.dockerHubApiRoot || dockerHubApiRoot))
            .then(cloud => generatePlan(cloud, providers, log, request, proxies.discoveryEtcdApiRoot || discoveryEtcdApiRoot))
            .then(plan => executePlan(plan, providers, log));
  }

};




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


// let manifest = {
//   locations: [{
//     id: '',
//     name: '',
//     provider: '',
//     machines: ['machineID']
//   }],
//   debug: {

//   }
// };
