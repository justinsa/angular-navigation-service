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

    this.$get = ['$injector', '$location', '$log', '$window', function ($injector, $location, $log, $window) {
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
          var i, locations, path;
          if (!_.isString(location)) {
            return false;
          }
          locations = this.tokenizePath(location);
          if (_.isEmpty(locations)) {
            return false;
          }
          path = this.tokenizePath();
          if (locations.length > path.length) {
            return false;
          }
          for (i = 0; i < locations.length; ++i) {
            if (locations[i] !== path[i]) {
              return false;
            }
          }
          return true;
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
         * call this function to navigate to a route and optionally push the current location to history.
         */
        goto: function (route, noHistory) {
          if (!_.isString(route)) {
            route = '/';
            noHistory = false;
          }
          var location = $location.path(route);
          if (noHistory === true) {
            // replace prevents the $location service from pushing the previous page to history
            location.replace();
          }
        },

        /**
         * call this function to pop and navigate to the previous location from history.
         */
        back: function () {
          $window.history.back();
        },

        /**
         * call this function to get the configuration options.
         */
        getConfiguration: function () {
          return configuration;
        },

        /**
         * returns an in-order array of lowercase tokens from a location string.
         * returns an empty array if no tokens are in the location string.
         * returns an in-order array of lowercase tokens from the current active location, if no location parameter is provided.
         */
        tokenizePath: function (location) {
          if (_.isUndefined(location) || _.isNull(location)) {
            location = $location.path();
          }
          if (!_.isString(location)) {
            return [];
          }
          return _.words(location.toLowerCase(), /[\w\-]+/g);
        }
      };
    }];
  });
})(window, window._, window.angular);
