"use strict";
var 
console.log('generators', g);
var doWrapper = require('do-wrapper');
var doProvider = require('./providers/digitalocean')({token: process.env.DO_TOKEN});
var provider = doProvider;
var launcher = require('./launcher')(provider, (function() {
  var $__3;
  for (var args = [],
      $__0 = 0; $__0 < arguments.length; $__0++)
    args[$__0] = arguments[$__0];
  return ($__3 = console).log.apply($__3, $traceurRuntime.spread([new Date()], args));
}));
var hogan = require('hogan.js');
var uuid = require('node-uuid');
var _ = require('lodash');
var keys = ['40:85:f0:9b:28:ad:5d:25:b5:51:2e:ad:f3:b3:31:98'];
var baseDir = path.join(__dirname, '..');
var cloud_config = fs.readFileSync(path.join(baseDir, 'cloud-config')).toString();
var bootstrapTemplate = fs.readFileSync(path.join(baseDir, 'bootstrap.sh.template')).toString();
cloud_config = hogan.compile(cloud_config);
bootstrapTemplate = hogan.compile(bootstrapTemplate);
var service_files = glob.sync('../services/**/*.service');
var services = _.reduce(service_files, (function(result, fileName) {
  var name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.service'));
  result[name] = {
    name: name,
    command: 'start',
    content: fs.readFileSync(fileName).toString()
  };
  return result;
}), {});
var log = (function() {
  var $__3;
  for (var args = [],
      $__1 = 0; $__1 < arguments.length; $__1++)
    args[$__1] = arguments[$__1];
  return ($__3 = console).log.apply($__3, $traceurRuntime.spread(args));
});
launchCluster(provider, log).then((function(machines) {
  return console.log('launched', machines.length, 'machines');
}), (function(error) {
  return console.log('error', error);
}));
function launchCluster(provider, log) {
  console.log(provider);
  return new Promise((function(resolve, reject) {
    request('https://discovery.etcd.io/new', (function(error, response, discovery_url) {
      if (error) {
        console.log('Error getting discovery url!');
        return false;
      }
      log('seed', discovery_url);
      var create = (function(count, role) {
        var location = 'sfo1',
            size = '512mb',
            image = 'coreos-alpha',
            then = (function() {});
        var launch = (function() {
          return _.map(_.range(count), (function(i) {
            var id = uuid.v4();
            var machine = {
              provider: provider.name,
              location: location,
              role: role,
              image: image,
              size: size,
              id: id,
              requested: new Date().getTime()
            };
            var metadata = _.map(machine, (function(value, key) {
              return key + '=' + value;
            })).join(',');
            var files = getFiles(machine);
            var userData = cloud_config.render({
              discovery_url: discovery_url,
              metadata: metadata,
              files: files
            });
            return {
              id: id,
              provider: provider.name,
              location: location,
              size: size,
              image: image,
              keys: keys,
              userData: userData
            };
          }));
        });
        var chain = ((function() {
          return (function(fn) {
            fn();
            return chain;
          });
        }))();
        chain.at = (function(l) {
          return chain((function() {
            return location = l;
          }));
        });
        chain.size = (function(s) {
          return chain((function() {
            return size = s;
          }));
        });
        chain.then = (function(t) {
          return chain((function() {
            return then = t;
          }));
        });
        chain.launch = launch;
        return chain;
      });
      var machines = _.flatten([create(1, 'core').at('sfo1').launch(), create(0, 'benchmarker').at('sfo1').launch(), create(0, 'influxdb').at('sfo1').size('2gb').launch(), create(0, 'grafana').at('sfo1').launch(), create(0, 'broadcaster').at('sfo1').launch()]);
      launcher.launch(machines).then((function(machines) {
        console.log('All machines launched!');
        fs.writeFileSync(path.join(baseDir, 'cloud.machines'), JSON.stringify(machines));
        resolve(machines);
      }), (function(error) {
        return reject(error);
      })).catch((function(error) {
        return reject(error);
      }));
    }));
  }));
}
var roleServices = {
  'core': ['cadvisor'],
  'influxdb': ['cadvisor', 'influxdb'],
  'grafana': ['cadvisor', 'grafana'],
  'broadcaster': ['cadvisor', 'broadcaster@'],
  'benchmarker': ['cadvisor', 'benchmarker']
};
function getFiles(machine) {
  var $__2 = machine,
      id = $__2.id,
      role = $__2.role;
  var services = roleServices[role];
  var bootstrap = {
    path: '/home/core/bootstrap.sh',
    owner: 'core',
    permissions: '0700',
    content: indent(bootstrapTemplate.render({services: _.map(services, (function(serviceName) {
        return {
          fileName: serviceName + '.service',
          name: serviceName + (serviceName.indexOf('@') >= 0 ? id : '')
        };
      }))}), '      ')
  };
  var util = {
    path: '/home/core/util.sh',
    owner: 'core',
    permissiosn: '0700',
    content: indent()
  };
  return [bootstrap, util].concat(_.map(services, makeFileRecord));
}
function makeFileRecord(serviceName) {
  var service = services[serviceName];
  if (!service) {
    console.log(serviceName, 'not found!');
  }
  return {path = require('path'),
    repl = require('repl'),
    glob = require('glob'),
    request = require('request')me: serviceName + (serviceName.indexOf('@') >= 0 ? id : '',
    polyfill = require('6to5/polyfill')rviceName) {
        return {
          fileName: serviceName + '.service',
          name: serviceName + (serviceName.indexOf('@') >=,
    g = require('generator-trees').gmplate.render({services: _.map(services, (function(serviceName) {
        return {
          fileName: serviceName + '.service',
          name: serviceName + (serviceName.indexOf('@') >= 0 ? id : '')
        };
      }))}), '      ')
  };
  var util = {
    path: '/home/core/util.sh',
    owner: 'core',
    permissiosn: '0700',
    content: indent()
  };
  return [bootstrap, util].concat(_.map(services, makeFileRecord));
}
function makeFileRecord(serviceName) {
  var service = services[serviceName];
  if (!service) {
    console.log(serviceName, 'not found!');
  }
  return {
    path: '/home/core/' + serviceName + '.service',
    owner: 'core',
    permissions: '0600',
    content: indent(service.content, '      ')
  };
}
function indent(s, i) {
  return s.replace(/^/gm, i);
}

//# sourceMappingURL=admin.js.map