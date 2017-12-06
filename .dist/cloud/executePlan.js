"use strict";
var $__buildLog__,
    $___46__46__47_templates__,
    $__lodash__,
    $__generator_45_trees__;
var buildLog = ($__buildLog__ = require("./buildLog"), $__buildLog__ && $__buildLog__.__esModule && $__buildLog__ || {default: $__buildLog__}).default;
var templates = ($___46__46__47_templates__ = require("../templates"), $___46__46__47_templates__ && $___46__46__47_templates__.__esModule && $___46__46__47_templates__ || {default: $___46__46__47_templates__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var gt = ($__generator_45_trees__ = require("generator-trees"), $__generator_45_trees__ && $__generator_45_trees__.__esModule && $__generator_45_trees__ || {default: $__generator_45_trees__}).default;

var $__4 = gt,
    g = $__4.g,
    p = $__4.p;
module.exports = (function(plan, providers, logFn) {
  var $__5 = buildLog(logFn, 'Execute'),
      log = $__5.log,
      start = $__5.start,
      ok = $__5.ok,
      bad = $__5.bad;
  var $__6 = plan,
      cloudID = $__6.cloudID,
      definition = $__6.definition,
      clusters = $__6.clusters;
  return launch();
  function launch() {
    return new Promise((function(resolve, reject) {
      start('Plan');
      var clustersByProvider = _.groupBy(plan.clusters, (function(cluster) {
        return cluster.providerName;
      }));
      var launchPromise = Promise.all(_.map(clustersByProvider, launchProviderClusters)).then((function(providerClusters) {
        var clusters = _.reduce(providerClusters, (function(result, clusters) {
          _.each(clusters, (function(cluster, id) {
            result[id] = cluster;
            cluster.machineCount = _.keys(cluster.machines).length;
          }));
          return result;
        }), {});
        var cloud = {
          id: cloudID,
          clusters: clusters,
          clusterCount: _.keys(clusters).length,
          definition: definition
        };
        ok('Plan', {cloud: cloud});
        resolve(cloud);
      }));
      launchPromise.catch((function(error) {
        reject(bad('Plan', {error: error}));
      }));
      return launchPromise;
    }));
  }
  function launchProviderClusters(clusters, providerName) {
    return new Promise((function(resolve, reject) {
      var provider = providers[providerName],
          launchedClusters = _.reduce(clusters, (function(result, cluster) {
            var $__7 = cluster,
                id = $__7.id,
                location = $__7.location,
                discoveryURL = $__7.discoveryURL;
            result[id] = {
              id: id,
              discoveryURL: discoveryURL,
              location: location,
              machines: {},
              provider: providerName
            };
            return result;
          }), {});
      start('Provider', {providerName: providerName});
      p.async(provider.api.MAX_CONCURRENT_CALLS, g.map(g.interleave(g.map(g.toGenerator(clusters), (function(cluster) {
        return cluster.machineGenerator();
      }))), (function(machineDef) {
        return new Promise((function(resolve, reject) {
          var $__7 = machineDef,
              id = $__7.id,
              roleName = $__7.roleName,
              cluster = $__7.cluster,
              generatedAt = $__7.generatedAt,
              $__8 = cluster,
              clusterID = $__8.id,
              location = $__8.location,
              providerName = $__8.providerName,
              discoveryURL = $__8.discoveryURL;
          var size = '512mb',
              image = 'coreos-stable';
          var files = getFiles(id, roleName),
              metadata = _.map({
                id: id,
                clusterID: clusterID,
                provider: providerName,
                location: location,
                size: size,
                image: image,
                roleName: roleName,
                generatedAt: generatedAt
              }, (function(value, key) {
                return (key + "=" + value);
              })).join(','),
              userData = templates.cloudConfig.render({
                discoveryURL: discoveryURL,
                metadata: metadata,
                files: files
              });
          var machine = {
            id: id,
            clusterID: clusterID,
            provider: providerName,
            location: location,
            size: size,
            image: image,
            roleName: roleName,
            keys: definition.authorizations,
            generatedAt: generatedAt,
            userData: userData
          };
          start('Machine', {machine: machine});
          provider.api.createMachine(machine).then((function(response) {
            machine.response = response;
            machine.providerData = response;
            ok('Machine', {
              machine: machine,
              machineDef: machineDef
            });
            resolve(machine);
          }), (function(error) {
            return reject(bad('Machine', {
              machine: machine,
              machineDef: machineDef,
              error: error
            }));
          }));
        }));
      })), (function(machine, machinesGeneratedSoFar) {
        launchedClusters[machine.clusterID].machines[machine.id] = _.pick(machine, ['size', 'image', 'roleName', 'generatedAt', 'response', 'id', 'providerData']);
      })).then((function(count) {
        ok('Provider', {providerName: providerName});
        resolve(launchedClusters);
      }), (function(error) {
        return reject(bad('Provider', {
          providerName: providerName,
          error: error
        }));
      }));
    }));
  }
  function getFiles(id, roleName) {
    var roles = definition.roles,
        containers = _.map(roles[roleName], (function(roleName) {
          return definition.containers[roleName];
        }));
    console.log({containers: containers});
    var bootstrap = {
      path: '/home/core/bootstrap.sh',
      owner: 'core',
      permissions: '0700',
      content: indent(templates.bootstrap.render({services: _.map(containers, getServices)}), '      ')
    };
    var util = {
      path: '/home/core/util.sh',
      owner: 'core',
      permissions: '0700',
      content: indent(templates.util_sh, '      ')
    };
    return [bootstrap, util].concat(_.map(containers, makeFileRecord));
    function getServices($__8) {
      var containerName = $__8.container;
      var secrets = getSecrets(containerName);
      var isGlobal = _.contains(definition.roles.$all || [], containerName);
      containerName = containerName + (isGlobal ? '' : '@');
      var fileName = (containerName + ".service"),
          name = ("" + containerName + (isGlobal ? '' : id));
      console.log('secrets', secrets);
      return {
        name: name,
        fileName: fileName,
        secrets: secrets
      };
    }
    function getSecrets(containerName) {
      var container = definition.containers[containerName],
          secrets = container.secrets || [];
      console.log(container, secrets);
      return _.map(secrets, (function(definition, name) {
        var type = definition.type;
        if (type === 'x509')
          return generate509CertificateCommand(name, definition);
        throw new Error(("Unknown secret type: " + type));
      }));
      function generate509CertificateCommand(name, definition) {
        var subject = ("/CN=" + id),
            keyName = (name + "/key"),
            certificateName = (name + "/crt"),
            days = 365,
            algorithm = 'rsa',
            bits = 2048;
        return {generateSecretCommand: ("mkdir -p ~/secrets/" + name + " && openssl req -x509 -nodes -days " + days + " -newkey " + algorithm + ":" + bits + " -keyout " + keyLocation + " -out " + certificateLocation + " -subj \"" + subject + "\"")};
      }
    }
    function makeFileRecord(container) {
      var containerName = container.container,
          isGlobal = _.contains(definition.roles.$all || [], containerName),
          template = isGlobal ? templates.containerService : templates['container@Service'],
          serviceName = containerName + (isGlobal ? '' : '@'),
          options = computeOptions(container);
      if (containerName === 'cadvisor' && !options)
        options = '-v /:/rootfs:ro -v /var/run:/var/run:rw -v /sys:/sys:ro -v /var/lib/docker:/var/lib/docker:ro -p 8080:8080';
      containerName = container.name;
      var service = {
        name: containerName,
        content: template.render({
          serviceName: serviceName,
          containerName: containerName,
          statsContainerName: containerName.replace('/', '_'),
          roleName: roleName,
          options: options,
          isGlobal: isGlobal
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
    if (container.options)
      return container.options;
    var $__7 = container,
        environment = $__7.environment,
        ports = $__7.ports,
        volumes = $__7.volumes;
    return _.compact([_.map(environment, (function(value, key) {
      return ("-e " + key + "=" + value);
    })).join(' '), _.map(ports, (function(from, to) {
      return ("-p " + to + (from === true ? '' : (':' + from)));
    })).join(' '), _.map(volumes, (function(from, to) {
      return ("-v " + to + (from === true ? '' : (':' + from)));
    })).join(' ')]).join(' ');
  }
});
function indent(s, i) {
  return s.replace(/^/gm, i);
}

//# sourceMappingURL=../cloud/executePlan.js.map