![Bower Version](https://img.shields.io/bower/v/ng-navigation-service.svg)
![Master Build Status](https://codeship.com/projects/016878e0-603a-0133-c6e2-5a99c145e314/status?branch=master)

A navigation helper service for Angular client applications.

##Dependencies

* AngularJS - http://angularjs.org
* Lodash - http://lodash.com

##Basic Setup

1. Add this module to your app as a dependency:
```JAVASCRIPT
var app = angular.module('yourApp', ['navigation.service']);
```
2. Configure the security service to use with the navigation provider:
```JAVASCRIPT
app.config(['$navigationProvider', function ($navigationProvider) {
  $navigationProvider.configure({
    securityService: 'authentication.service'
  });
}]);
```
3. Inject $navigation as a parameter in declarations that require it:
```JAVASCRIPT
app.controller('yourController', function($scope, $navigation){ ... });
```

##Configuration Options

The default configuration is:

1. securityService: undefined - this string value must be provided during configuration and must be a loaded service that supports the following API:
  1. function ```isAuthenticated()```
  2. function ```roles()```
2. roleToAudienceMapFunction: function returns the userRole provided.
3. inAudienceValidationFunction: function determines if the userRoles are in the audiences.
4. activeLinkDecorator: mixed
5. inactiveLinkDecorator: mixed

To override the default configuration options, configure the module with an options argument during application configuration:
```JAVASCRIPT
app.config(['$navigationProvider', function ($navigationProvider) {
  $navigationProvider.configure({
    securityService: 'authentication.service',
    roleToAudienceMapFunction: function (userRole) { ... },
    inAudienceValidationFunction: function (userRoles, audiences) { ... }
  });
}]);
```

The ng-navigation-service was designed in tandem with the following projects:

* https://github.com/EQCO/angular-authentication-service
* https://github.com/EQCO/angular-oauth-service

##Basic Usage

###inAudience
```JAVASCRIPT
// returns true if the user is in any of the specified audiences
$navigation.inAudience('X', 'Y', 'Z');
```

###isActiveLocation
```JAVASCRIPT
// returns true if the location is the current active location
// the following will match any location that starts with the /dashboard route
$navigation.isActiveLocation('/dashboard');

// can also handle sub-routes using '/'
// the leading '/' is optional
$navigation.isActiveLocation('dashboard/user');
```

###decorateLink
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

###goto
```JAVASCRIPT
// Navigate to a route and optionally push the current location to history.
$navigation.goto(route, noHistory);
```

###back
```JAVASCRIPT
// Pop and navigate to the previous location from history.
$navigation.back();
```

##Additional Methods
These methods were primarily implemented for testing or utility purposes, but they may be useful in special scenarios and are part of the exposed API.

###getConfiguration
```JAVASCRIPT
// Get the configuration options
$navigation.getConfiguration();
```

###tokenizePath
```JAVASCRIPT
// $navigation.tokenizePath(location);
// returns an in-order array of lowercase tokens from a location string.
// returns an empty array if no tokens are in the location string.
// returns an in-order array of lowercase tokens from the current active location, if no location parameter is provided.
$navigation.tokenizePath('/dashboard');

// parameter @location is optional and if set to a falsy value will be
// overridden by the value of ``$location.path()``.
```

##Development
After forking you should only have to run ```npm install``` from a command line to get your environment setup.

After install you have two gulp commands available to you:

1. ```gulp js:lint```
2. ```gulp js:test```
