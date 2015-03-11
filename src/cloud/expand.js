import _ from 'lodash';


// yeah, a Promise isn't really necessary here, but it's 'needed' in validate.js
module.exports = cloud => new Promise((resolve, reject) => {
  const {configuration, roles, containers} = cloud;

  expandRoles(configuration, roles);
  inject$all(roles);
  expandContainers(roles, containers);

  resolve(cloud);

  function expandRoles(configuration, roles) {
    _.each(configuration, (roleConfiguration, roleName) => {
      if (typeof roleConfiguration === 'number') {
        if (!roles[roleName]) {
          roles[roleName] = [roleName];
        }
      }
      else {
        expandRoles(roleConfiguration, roles);
      }
    });
  }

  // Should we be using Sets?
  // TODO: investigate ^^
  function inject$all(roles) {
    const {$all} = roles;

    if ($all && $all.length > 0) {
      _.each(roles, (role, roleName) => {
        if (roleName !== '$all') {
          role.splice(0, 0, ...$all);
        }
      });
    }
  }

  function expandContainers(roles, containers) {
    _.each(roles, (roleConfiguration, roleName) => {
      if (roleName === '$all') return;

      if (!containers[roleName]) {
        containers[roleName] = {container: roleName};
      }
    });
  }
});