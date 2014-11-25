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

The ng-navigation-service was designed in conjunction with the following projects:

* https://github.com/EQCO/angular-authentication-service
* https://github.com/EQCO/angular-oauth-service

##Basic Usage
###inAudience
```JAVASCRIPT
// returns true if the user is in any of the specified audiences.
$navigation.inAudience('X', 'Y', 'Z');
```

###isActiveLocation
```JAVASCRIPT
// returns true if the location is the current active location.
$navigation.isActiveLocation('/dashboard');
```

##Additional Methods
These methods were primarily implemented for testing purposes, but they may be useful in special scenarios and are part of the exposed API.

```JAVASCRIPT
// Get the configuration hash
$store.getConfiguration();
```

##Development
After forking you should only have to run ```npm install``` from a command line to get your environment setup.

After install you have two gulp commands available to you:

1. ```gulp js:lint```
2. ```gulp js:test```