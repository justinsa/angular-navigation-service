(function (window, _, angular, undefined) {
  'use strict';
  var module = angular.module('navigation.service', ['authentication.service']);
  module.provider('$navigation', function() {
    var configuration = {
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

    this.$get = ['$authentication', function ($authentication) {
      return {
        /**
         * returns true if the user is in any of the specified audiences.
         */
        inAudience: function() {
          var args = _.toArray(arguments);
          var authenticated = $authentication.isAuthenticated();
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
          return configuration.inAudienceValidationFunction($authentication.roles(), args);
        },

        /**
         * call this function to get the configuration options.
         */
        getConfiguration: function() {
          return configuration;
        }
      };
    }];
  });
})(window, window._, window.angular);
