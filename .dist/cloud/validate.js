"use strict";
var $__buildLog__,
    $__lodash__;
var buildLog = ($__buildLog__ = require("./buildLog"), $__buildLog__ && $__buildLog__.__esModule && $__buildLog__ || {default: $__buildLog__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
module.exports = (function(cloud, providers, logFn, request, dockerHubApiRoot) {
  var $__2 = buildLog(logFn, 'Validate'),
      log = $__2.log,
      start = $__2.start,
      ok = $__2.ok,
      bad = $__2.bad;
  start('Cloud Description');
  var $__3 = cloud,
      domain = $__3.domain,
      root = $__3.root,
      authorizations = $__3.authorizations,
      locations = $__3.locations,
      configuration = $__3.configuration,
      roles = $__3.roles,
      containers = $__3.containers;
  var promise = validateDomain(cloud).then(validateRoot).then(validateAuthorizations).then(validateLocations).then(validateProviderCredentials).then(validateContainers).then(validateRoles).then(validateConfiguration).then((function() {
    ok('Cloud Description');
    return cloud;
  }));
  promise.catch((function(error) {
    return bad('Cloud Description', {error: error});
  }));
  return promise;
  function validateDomain() {
    return new Promise((function(resolve, reject) {
      if (cloud.domain) {
        start('Domain');
        ok('Domain');
      }
      resolve();
    }));
  }
  function validateRoot() {
    return new Promise((function(resolve, reject) {
      if (cloud.root) {
        start('Root');
        ok('Root');
      }
      resolve();
    }));
  }
  function validateAuthorizations() {
    return new Promise((function(resolve, reject) {
      if (cloud.authorizations) {
        start('Authorizations');
        ok('Authorizations');
      }
      resolve();
    }));
  }
  function validateLocations() {
    return new Promise((function(resolve, reject) {
      start('Locations');
      var invalidProviders = _.filter(_.keys(locations), (function(providerName) {
        return !providers[providerName];
      }));
      if (invalidProviders.length > 0) {
        return reject(bad('Locations', {invalidProviders: invalidProviders}));
      }
      var invalidLocations = _.pick(_.mapValues(locations, (function(locations, providerName) {
        var provider = providers[providerName];
        return _.filter(locations, (function(location) {
          return !provider.profile.locations[location];
        }));
      })), (function(locations) {
        return locations.length > 0;
      }));
      if (_.keys(invalidLocations).length > 0) {
        return reject(bad('Locations', {invalidLocations: invalidLocations}));
      }
      var providerCount = 0;
      var locationCount = _.reduce(locations, (function(count, locations, providerName) {
        var provider = providers[providerName];
        if (locations.length)
          providerCount++;
        return count + locations.length;
      }), 0);
      if (isNaN(locationCount) || locationCount === 0) {
        return reject(bad('Locations', {status: 'No locations selected!'}));
      }
      ok('Locations', {status: ("Will Launch on " + providerCount + " Provider" + (providerCount > 1 ? 's' : '') + " in " + locationCount + " Location" + (locationCount > 1 ? 's' : '') + "!")});
      resolve();
    }));
  }
  function validateProviderCredentials() {
    return new Promise((function(resolve, reject) {
      start('Credentials');
      var usedProviders = _.map(_.pick(cloud.locations, (function(locations) {
        return locations.length > 0;
      })), (function(locations, providerName) {
        return providers[providerName];
      }));
      var missing = {};
      _.each(usedProviders, (function(provider) {
        var missingValues = checkProviderConfiguration(provider);
        if (missingValues.length > 0)
          missing[provider.name] = missingValues;
      }));
      if (_.keys(missing).length > 0) {
        return reject(bad('Credentials', {missing: missing}));
      }
      Promise.all(_.map(usedProviders, (function(provider) {
        return provider.api.verifyAccount();
      }))).then((function(error, data, response) {
        ok('Credentials');
        resolve();
      })).catch((function(e) {
        var $__4 = e,
            error = $__4.error,
            data = $__4.data,
            response = $__4.response,
            provider = $__4.provider;
        reject(bad('Credentials', {
          error: error,
          data: data,
          provider: provider
        }));
      }));
      function checkProviderConfiguration(provider) {
        var $__4 = provider,
            credentialSchema = $__4.credentialSchema,
            credentials = $__4.credentials,
            missing = [];
        _.each(credentialSchema, (function(schema, name) {
          var value = credentials[name];
          if (value === undefined || value === null || value.length === 0) {
            missing.push(name);
          }
        }));
        return missing;
      }
    }));
  }
  function validateContainers() {
    start('Containers');
    var requests = {},
        validationFailed = false;
    var validationPromise = Promise.all(_.map(containers, (function(containerDescription, name) {
      return checkDockerRegistry(containerDescription.name || name);
    })));
    validationPromise.catch((function(e) {
      log('validateContainers failed');
      _.each(requests, (function(request, url) {
        log('Aborting', url);
        request.abort();
      }));
      bad('Containers');
    }));
    return validationPromise.then((function(value) {
      ok('Containers');
      return value;
    }));
    function checkDockerRegistry(containerName) {
      return new Promise((function(resolve, reject) {
        start('Container', {containerName: containerName});
        var matches = containerName.match(/([^\/]*)(?:\/([^:]*))?(?::(\w*))?/);
        if (!matches) {
          reject(bad('Container', {
            containerName: containerName,
            message: 'Could not parse'
          }));
          return ;
        }
        var namespace = matches[1],
            image = matches[2],
            tag = matches[3] || 'latest',
            qualifiedName = namespace + (image ? ("/" + image) : ''),
            url = (dockerHubApiRoot + "/v1/repositories/" + qualifiedName + "/tags/" + tag);
        requests[url] = request(url, (function(error, response, body) {
          delete requests[url];
          if (error)
            reject({
              type: 'HubConnection',
              message: 'Could not connect!',
              error: error
            });
          else {
            var statusCode = response.statusCode;
            if (statusCode === 200) {
              ok('Container', {
                containerName: containerName,
                tag: tag
              });
              resolve();
            } else if (statusCode === 404) {
              reject(bad('Container', {
                containerName: containerName,
                tag: tag,
                message: 'Does not exist!'
              }));
            } else {
              reject(bad('Container', {
                containerName: containerName,
                tag: tag,
                statusCode: statusCode
              }));
            }
          }
        }));
      }));
    }
  }
  function validateRoles() {
    return new Promise((function(resolve, reject) {
      resolve();
    }));
  }
  function validateConfiguration() {
    return new Promise((function(resolve, reject) {
      start('Configuration');
      ok('Configuration');
      resolve();
    }));
  }
});

//# sourceMappingURL=../cloud/validate.js.map