(function (window, _, angular, undefined) {
  'use strict';
  var module = angular.module('navigation.service', []);
  module.provider('$navigation', function () {
    var configuration = {
      activeLinkDecorator: undefined,
      inactiveLinkDecorator: undefined,
      securityService: undefined,
      roleToAudienceMapFunction: function (userRole) {
        return userRole;
      },
      inAudienceValidationFunction: function (userRoles, audiences) {
        var userAudiences = _.flatten(userRoles, this.roleToAudienceMapFunction);
        return !_.isEmpty(userAudiences) && !_.isEmpty(audiences) &&
          (_.find(audiences, function (audience) { return _.contains(userAudiences, audience); }) !== undefined);
      }
    };

    /**
     * call this function to provide configuration options to the service.
     */
    this.configure = function (configurationOpts) {
      configuration = _.defaults(configurationOpts, configuration);
    };

    this.$get = ['$injector', '$location', '$log', function ($injector, $location, $log) {
      var secService;
      var securityService = function () {
        if (secService === undefined) {
          if (!_.isString(configuration.securityService)) {
            $log.error('No securityService configuration value provided');
            return undefined;
          }
          if (!$injector.has(configuration.securityService)) {
            $log.error('No matching service registered in Angular: ', configuration.securityService);
            return undefined;
          }
          secService = $injector.get(configuration.securityService);
          _.each(['isAuthenticated', 'roles'], function (methodName) {
            if (!_.has(secService, methodName)) {
              $log.error('Matching service is missing method: ', methodName);
              return undefined;
            }
          });
        }
        return secService;
      };

      return {
        /**
         * returns true if the user is in any of the specified audiences.
         */
        inAudience: function () {
          var args = _.toArray(arguments);
          var authenticated = securityService().isAuthenticated();
          // handle 'all' and 'anonymous' special cases
          if (args.length === 1 && _.isString(args[0])) {
            if (args[0].toUpperCase() === 'ALL') {
              return authenticated;
            }
            if (args[0].toUpperCase() === 'ANONYMOUS') {
              return !authenticated;
            }
          }
          // handle generic case of a list of defined roles
          if (args.length === 0 || !authenticated) {
            return false;
          }
          return configuration.inAudienceValidationFunction(securityService().roles(), args);
        },

        /**
         * returns true if the location is the current active location.
         */
        isActiveLocation: function (location) {
          if (!_.isString(location)) {
            return false;
          }
          location =  location.trim().toLowerCase();
          if (_.isEmpty(location)) {
            return false;
          }
          var path = $location.path().toLowerCase();
          if (location.charAt(0) !== '/') {
            // remove leading front-slash from path
            path = path.slice(1);
          }
          return path === location;
        },

        /**
         * returns the active decorator if the location is the current active location.
         * returns the inactive decorator if the location is not the current active location.
         */
        decorateLink: function (item, active, inactive) {
          active = active || configuration.activeLinkDecorator;
          inactive = inactive || configuration.inactiveLinkDecorator;
          return this.isActiveLocation(item) ? active : inactive;
        },

        /**
         * call this function to get the configuration options.
         */
        getConfiguration: function () {
          return configuration;
        }
      };
    }];
  });
})(window, window._, window.angular);
