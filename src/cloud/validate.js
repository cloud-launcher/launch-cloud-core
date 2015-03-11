import _ from 'lodash';

module.exports = (cloud, providers, log, request, dockerHubApiRoot) => {
  log('Validating Cloud Description');

  const {
    domain,
    root,
    authorizations,
    locations,
    configuration,
    roles,
    containers
  } = cloud;

  return validateDomain(cloud)
          .then(validateRoot)
          .then(validateAuthorizations)
          .then(validateLocations)
          .then(validateContainers)
          .then(validateRoles)
          .then(validateConfiguration)
          .then(() => { return cloud; });

  function validateDomain() {
    return new Promise((resolve, reject) => {
      if (cloud.domain) {
        log('Validating Domain');
      }

      resolve();
    });
  }

  function validateRoot() {
    return new Promise((resolve, reject) => {
      if (cloud.root) {
        log('Validating Root');
      }

      resolve();
    });
  }

  function validateAuthorizations() {
    return new Promise((resolve, reject) => {
      if (cloud.authorizations) {
        log('Validating Authorizations');
      }

      resolve();
    });
  }

  function validateLocations() {
    return new Promise((resolve, reject) => {
      log('Validating Locations');

      const locationCount = _.reduce(locations, (count, locations, providerName) => {
        const provider = providers[providerName];

        if (!provider) {
          reject(new Error(['No provider with name', providerName].join(' ')));
          return;
        }

        _.each(locations, location => {
          if (!provider.profile.locations[location]){
            reject(new Error(['Provider', providerName, 'has no location', location].join(' ')));
            return;
          }
        });

        return count + locations.length;
      }, 0);

      if (isNaN(locationCount) || locationCount === 0) {
        reject(new Error('No locations selected!'));
        return;
      }

      log(`Will launch in ${locationCount} locations!`);

      resolve();
    });
  }

  function validateContainers() {
    log('Validating Containers');

    let requests = {},
        validationFailed = false;

    const validationPromise = Promise.all(_.map(containers, (containerDescription, name) => {


      // return checkDockerRegistry(namespace, repository, tag);
      return checkDockerRegistry(containerDescription.container || name);
    }));

    validationPromise.catch(e => {
      log('validateContainers failed');
      _.each(requests, (request, url) => {
        log('Aborting', url);
        request.abort();
      });
      validationFailed = true;
    });

    return validationPromise;

    function checkDockerRegistry(containerName) {
      let [namespace, image] = containerName.split('/'),
            [repository, tag] = (image || namespace).split(':'),
            qualifiedName = namespace + (image ? `/${repository}` : '');


      tag = tag || 'latest';
      const url = `${dockerHubApiRoot}/v1/repositories/${qualifiedName}/tags/${tag}`;
      log(`Looking for container ${qualifiedName}:${tag} at ${url}`);
      return new Promise((resolve, reject) => {
        requests[url] = request(url, (error, response, body) => {
          delete requests[url];

          if (error) reject(new Error(['Error checking Docker registry', error].join(' ')));
          else {
            if (response.statusCode === 200) {
              if (!log(`Found ${qualifiedName}:${tag}`));
              resolve();
            }
            else reject(new Error(`Did not find ${qualifiedName}:${tag} on Docker registry!`));
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
      log('Validating Configuration', cloud);
      resolve();
    });
  }
};