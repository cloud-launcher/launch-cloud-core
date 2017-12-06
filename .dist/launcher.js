"use strict";
var $__hjson__,
    $__lodash__,
    $__request__,
    $__providers__;
var hjson = ($__hjson__ = require("hjson"), $__hjson__ && $__hjson__.__esModule && $__hjson__ || {default: $__hjson__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var request = ($__request__ = require("request"), $__request__ && $__request__.__esModule && $__request__ || {default: $__request__}).default;
var providers = ($__providers__ = require("./providers"), $__providers__ && $__providers__.__esModule && $__providers__ || {default: $__providers__}).default;
module.exports = (function(out) {
  return {launch: launch};
  function launch(text) {
    function parse(text) {
      return $traceurRuntime.asyncWrap(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              console.log('parse');
              $ctx.state = 5;
              break;
            case 5:
              $ctx.returnValue = hjson.parse(text.toString());
              $ctx.state = 2;
              break;
            case 2:
              $ctx.state = -2;
              break;
            default:
              return $ctx.end();
          }
      }, this);
    }
    function validate(description) {
      var $__6 = description,
          domain = $__6.domain,
          root = $__6.root,
          authorizations = $__6.authorizations,
          locations = $__6.locations,
          configuration = $__6.configuration,
          roles = $__6.roles,
          containers = $__6.containers;
      return validateDomain(description).then(validateRoot).then(validateAuthorizations).then(validateLocations).then(validateContainers).then(validateRoles).then(validateConfiguration).then((function() {
        return description;
      }));
      function validateDomain() {
        return $traceurRuntime.asyncWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                console.log('Validating Domain');
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      }
      function validateRoot() {
        console.log('Validating Root');
      }
      function validateAuthorizations() {
        console.log('Validating Authorizations');
      }
      function validateLocations() {
        console.log('Validating Locations');
        _.each(locations, (function(locations, providerName) {
          var provider = providers[providerName];
          if (!provider)
            throw new Error(['No provider with name', providerName].join(' '));
          _.each(locations, (function(location) {
            if (provider.profile.locations[location]) {
              throw new Error(['Provider', providerName, 'has no location', location].join(' '));
            }
          }));
        }));
      }
      function validateContainers() {
        function checkDockerRegistry(namespace, repository, tag) {
          var url;
          return $traceurRuntime.asyncWrap(function($ctx) {
            while (true)
              switch ($ctx.state) {
                case 0:
                  tag = tag || 'latest';
                  url = ("https://registry.hub.docker.com/v1/repositories/" + namespace + "/" + repository + "/tags/" + tag);
                  $ctx.state = 4;
                  break;
                case 4:
                  Promise.resolve(promise(request, url).then((function(response) {
                    if (response.statusCode === 200) {
                      console.log(("Found " + namespace + "/" + repository + ":" + tag));
                    } else
                      throw new Error(("Did not find " + namespace + "/" + repository + ":" + tag + " on Docker registry!"));
                  }), (function(error) {
                    throw new Error(['Error checking Docker registry', error].join(' '));
                  }))).then($ctx.createCallback(-2), $ctx.errback);
                  return ;
                default:
                  return $ctx.end();
              }
          }, this);
        }
        return $traceurRuntime.asyncWrap(function($ctx) {
          while (true)
            switch ($ctx.state) {
              case 0:
                console.log('Validating Containers');
                $ctx.state = 5;
                break;
              case 5:
                $ctx.returnValue = Promise.all(_.map(containers, (function(containerDescription, name) {
                  var $__8,
                      $__9,
                      $__11,
                      $__12;
                  var $__7 = containerDescription.container.split('/'),
                      namespace = ($__8 = $__7[$traceurRuntime.toProperty(Symbol.iterator)](), ($__9 = $__8.next()).done ? void 0 : $__9.value),
                      image = ($__9 = $__8.next()).done ? void 0 : $__9.value,
                      $__10 = image.split(':'),
                      repository = ($__11 = $__10[$traceurRuntime.toProperty(Symbol.iterator)](), ($__12 = $__11.next()).done ? void 0 : $__12.value),
                      tag = ($__12 = $__11.next()).done ? void 0 : $__12.value;
                  return checkDockerRegistry(namespace, repository, tag);
                })));
                $ctx.state = 2;
                break;
              case 2:
                $ctx.state = -2;
                break;
              default:
                return $ctx.end();
            }
        }, this);
      }
      function validateRoles() {
        return new Promise((function(resolve, reject) {
          resolve();
        }));
      }
      function validateConfiguration() {
        return new Promise((function(resolve, reject) {
          resolve();
        }));
      }
    }
    function generatePlan() {
      console.log('generatePlan');
    }
    function executePlan() {
      console.log('executePlan');
    }
    return $traceurRuntime.asyncWrap(function($ctx) {
      while (true)
        switch ($ctx.state) {
          case 0:
            console.log('launch');
            $ctx.state = 4;
            break;
          case 4:
            Promise.resolve(parse(text).then(validate).then(generatePlan).then(executePlan)).then($ctx.createCallback(-2), $ctx.errback);
            return ;
          default:
            return $ctx.end();
        }
    }, this);
  }
});
function ratelimit(count, gen) {
  return $traceurRuntime.asyncWrap(function($ctx) {
    while (true)
      switch ($ctx.state) {
        case 0:
          $ctx.state = -2;
          break;
        default:
          return $ctx.end();
      }
  }, this);
}
function promise(fn) {
  for (var args = [],
      $__4 = 1; $__4 < arguments.length; $__4++)
    args[$__4 - 1] = arguments[$__4];
  return new Promise((function(resolve, reject) {
    fn.apply((void 0), $traceurRuntime.spread(args, [(function(error) {
      for (var rest = [],
          $__5 = 1; $__5 < arguments.length; $__5++)
        rest[$__5 - 1] = arguments[$__5];
      if (error)
        reject(error);
      else
        resolve.apply((void 0), $traceurRuntime.spread(rest));
    })]));
  }));
}

//# sourceMappingURL=launcher.js.map