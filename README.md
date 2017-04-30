[![Bower Version](https://img.shields.io/bower/v/ng-navigation-service.svg)](https://github.com/justinsa/angular-navigation-service)
[![NPM Version](https://img.shields.io/npm/v/ng-navigation-service.svg)](https://www.npmjs.com/package/ng-navigation-service)
![Master Build Status](https://codeship.com/projects/016878e0-603a-0133-c6e2-5a99c145e314/status?branch=master)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/justinsa/angular-navigation-service/blob/master/LICENSE)

A navigation helper service for Angular client applications.

## Dependencies

* AngularJS - http://angularjs.org
* Lodash - http://lodash.com

## Configurable Dependencies

* ng-authentication-service - https://github.com/justinsa/angular-authentication-service

The ng-navigation-service was designed in tandem with the ng-authentication-service, but it is not a hard requirement. The configured security service must support the following API:

  1. ```boolean isAuthenticated()```
  2. ```[String] roles()```

## Basic Setup

Add this module to your app as a dependency:
```JAVASCRIPT
var app = angular.module('yourApp', ['navigation.service']);
```

Configure a security service to use with the navigation provider:
```JAVASCRIPT
app.config(['$navigationProvider', function ($navigationProvider) {
  $navigationProvider.configure({
    securityService: '$authentication'
  });
}]);
```

Inject $navigation as a parameter in declarations that require it:
```JAVASCRIPT
app.controller('yourController', function($scope, $navigation){ ... });
```

## Configuration Options

To override the default configuration options, configure the module with an options argument during application configuration and provide overrides for any of the following options.

```JAVASCRIPT
app.config(['$navigationProvider', function ($navigationProvider) {
  $navigationProvider.configure({
    activeLinkDecorator: undefined,
    inactiveLinkDecorator: undefined,
    securityService: undefined,
    extensions: undefined,
    roleToAudienceMapFunction: function (userRole) {
      return userRole;
    },
    inAudienceValidationFunction: function (userRoles, audiences) {
      var userAudiences = _.flatten(userRoles, this.roleToAudienceMapFunction);
      return !_.isEmpty(userAudiences) && !_.isEmpty(audiences) &&
        (_.find(audiences, function (audience) { return _.includes(userAudiences, audience); }) !== undefined);
    }
  });
}]);
```

### extensions

All properties (own and inherited) of the extensions object will be available as native to the $navigation service API. The extensions object is applied using the [_.defaults(...)](https://lodash.com/docs/#defaults) method and cannot overwrite any of the existing API properties. This is intended to provide implementors with a way to add objects or functions that are application specific and should fall within the context of the navigation service to expose, e.g., a hash of link objects or a function to re-write links.

## API

### inAudience
```JAVASCRIPT
// returns true if the user is in any of the specified audiences
$navigation.inAudience('X', 'Y', 'Z');
```

### isActiveLocation
```JAVASCRIPT
// returns true if the location is the current active location
// the following will match any location that starts with the /dashboard route
$navigation.isActiveLocation('/dashboard');

// can also handle sub-routes using '/'
// the leading '/' is optional
$navigation.isActiveLocation('dashboard/user');
```

### decorateLink
```JAVASCRIPT
// $navigation.decorateLink(item, active, inactive);
// returns the active decorator if the location is the current active location (see isActiveLocation).
// returns the inactive decorator if the location is not the current active location.
$navigation.decorateLink('/dashboard', 'active-item', undefined);

// parameters @active and @inactive are optional and if set to a falsy value will be
// overridden by the corresponding configuration values, if those are set:
//   configuration.activeLinkDecorator
//   configuration.inactiveLinkDecorator
$navigation.decorateLink('/dashboard');
```

### goto
```JAVASCRIPT
// Navigate to a route and optionally push the current location to history.
$navigation.goto(route, noHistory);
```

### back
```JAVASCRIPT
// Pop and navigate to the previous location from history.
$navigation.back();
```

## Additional Methods
These methods were primarily implemented for testing or utility purposes, but they may be useful in special scenarios and are part of the exposed API.

### getConfiguration
```JAVASCRIPT
// Get the configuration options
$navigation.getConfiguration();
```

### tokenizePath
```JAVASCRIPT
// $navigation.tokenizePath(location);
// returns an in-order array of lowercase tokens from a location string.
// returns an empty array if no tokens are in the location string.
// returns an in-order array of lowercase tokens from the current active location, if no location parameter is provided.
$navigation.tokenizePath('/dashboard');

// parameter @location is optional and if set to a falsy value will be
// overridden by the value of ``$location.path()``.
```

## Development
After forking you should only have to run ```npm install``` from a command line to get your environment setup.

After install you have two gulp commands available to you:

1. ```gulp js:lint```
2. ```gulp js:test```
