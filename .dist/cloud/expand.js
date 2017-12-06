"use strict";
var $__lodash__;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
module.exports = (function(cloud) {
  return new Promise((function(resolve, reject) {
    var $__1 = cloud,
        configuration = $__1.configuration,
        roles = $__1.roles,
        containers = $__1.containers;
    expandRoles(configuration, roles);
    inject$all(roles);
    expandContainers(roles, containers);
    resolve(cloud);
    function expandRoles(configuration, roles) {
      _.each(configuration, (function(roleConfiguration, roleName) {
        if (typeof roleConfiguration === 'number') {
          if (!roles[roleName]) {
            roles[roleName] = [roleName];
          }
        } else {
          expandRoles(roleConfiguration, roles);
        }
      }));
    }
    function inject$all(roles) {
      var $all = roles.$all;
      if ($all && $all.length > 0) {
        _.each(roles, (function(role, roleName) {
          if (roleName !== '$all') {
            _.each($all, (function($allRole) {
              if (!_.contains(role, $allRole))
                role.unshift($allRole);
            }));
          }
        }));
      }
    }
    function expandContainers(roles, containers) {
      _.each(roles, (function(roleConfiguration, roleName) {
        if (roleName === '$all')
          return ;
        if (Array.isArray(roleConfiguration)) {
          _.each(roleConfiguration, (function(containerName) {
            if (!containers[containerName]) {
              containers[containerName] = {container: containerName};
            }
          }));
        } else
          throw new Error(("What is this role:? " + roleName));
      }));
      _.each(containers, (function(definition, containerName) {
        var $__2 = definition,
            container = $__2.container,
            namespace = $__2.namespace;
        definition.container = containerName;
        definition.name = (namespace ? namespace + '/' : '') + containerName;
      }));
    }
  }));
});

//# sourceMappingURL=../cloud/expand.js.map