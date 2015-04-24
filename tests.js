/* globals beforeEach, describe, inject, it */
'use strict';
describe('$navigation', function() {
  beforeEach(function() {
    module('navigation.service', function ($navigationProvider, $provide) {
      $navigationProvider.configure({
        activeLinkDecorator: 'active-decorator',
        inactiveLinkDecorator: 'inactive-decorator',
        securityService: '$security'
      });
      $provide.factory('$security', function () {
        return {
          isAuthenticated: function () {
            return true;
          },
          roles: function () {
            return ['customer', 'internal'];
          }
        };
      });
    });
  });

  it('should have an expected default configuration',
    inject(function ($navigation) {
      var configuration = $navigation.getConfiguration();
      configuration.inAudienceValidationFunction.should.be.a.Function; // jshint ignore:line
      configuration.roleToAudienceMapFunction.should.be.a.Function; // jshint ignore:line
      configuration.activeLinkDecorator.should.equal('active-decorator');
      configuration.inactiveLinkDecorator.should.equal('inactive-decorator');
      configuration.securityService.should.equal('$security');
    })
  );

  it('should have a list of functions',
    inject(function ($navigation) {
      var functions = ['decorateLink', 'getConfiguration', 'inAudience', 'isActiveLocation', 'tokenizePath'];
      for (var i in functions) {
        $navigation[functions[i]].should.be.a.Function; // jshint ignore:line
      }
    })
  );

  describe('goto', function () {
    it('should navigate to root on undefined input for route',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.goto();
        $location.path().should.match('/');
      })
    );

    it('should navigate to root on null input for route',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.goto(null);
        $location.path().should.match('/');
      })
    );

    it('should navigate to root on numeric input for route',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.goto(120);
        $location.path().should.match('/');
      })
    );

    it('should navigate to root on object input for route',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.goto({});
        $location.path().should.match('/');
      })
    );

    it('should navigate to a string route',
      inject(function ($location, $navigation) {
        $location.path('/');
        $location.path().should.match('/');
        $navigation.goto('home');
        $location.path().should.match('/home');
      })
    );
  });

  describe('tokenizePath', function () {
    it('should return an empty array for non-string parameter values',
      inject(function ($location, $navigation) {
        $navigation.tokenizePath([]).should.eql([]);
        $navigation.tokenizePath(false).should.eql([]);
        $navigation.tokenizePath(1000).should.eql([]);
        $navigation.tokenizePath({}).should.eql([]);
      })
    );

    it('should return an empty array when no parameter provided and the location has no parts',
      inject(function ($location, $navigation) {
        $location.path('/');
        $location.path().should.match('/');
        $navigation.tokenizePath().should.eql([]);
        $navigation.tokenizePath(null).should.eql([]);
      })
    );

    it('should return an array when no parameter provided and the location has one part',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.tokenizePath().should.eql(['home']);
        $navigation.tokenizePath(null).should.eql(['home']);
      })
    );

    it('should return an array when no parameter provided and the location has more than one part',
      inject(function ($location, $navigation) {
        $location.path('/home/on/the/range');
        $location.path().should.match('/home/on/the/range');
        $navigation.tokenizePath().should.eql(['home', 'on', 'the', 'range']);
      })
    );

    it('should return an array when the parameter has one part',
      inject(function ($location, $navigation) {
        $navigation.tokenizePath('/home').should.eql(['home']);
      })
    );

    it('should return an array when the parameter has more than one part',
      inject(function ($location, $navigation) {
        $navigation.tokenizePath('home/on/the/range').should.eql(['home', 'on', 'the', 'range']);
      })
    );
  });

  describe('inAudience', function() {
    describe('with no authenticated user', function() {
      beforeEach(function() {
        module(function ($provide) {
          $provide.factory('$security', function () {
            return {
              isAuthenticated: function () {
                return false;
              },
              roles: function () {
                return [];
              }
            };
          });
        });
      });

      it('should be true if anonymous',
        inject(function ($navigation) {
          $navigation.inAudience('anonymous').should.equal(true);
        })
      );

      it('should be false if all',
        inject(function ($navigation) {
          $navigation.inAudience('all').should.equal(false);
        })
      );
    });

    describe('with an authenticated user', function() {
      beforeEach(function() {
        module(function ($provide) {
          $provide.factory('$security', function () {
            return {
              isAuthenticated: function () {
                return true;
              },
              roles: function () {
                return ['a'];
              }
            };
          });
        });
      });

      it('should be false if anonymous',
        inject(function ($security, $navigation) {
          $security.isAuthenticated().should.equal(true);
          $navigation.inAudience('anonymous').should.equal(false);
        })
      );

      it('should be true if all',
        inject(function ($security, $navigation) {
          $security.isAuthenticated().should.equal(true);
          $navigation.inAudience('all').should.equal(true);
        })
      );

      it('should be false if user is not in audience',
        inject(function ($security, $navigation) {
          $security.isAuthenticated().should.equal(true);
          $navigation.inAudience('b').should.equal(false);
        })
      );

      it('should be true if user is in audience',
        inject(function ($security, $navigation) {
          $security.isAuthenticated().should.equal(true);
          $navigation.inAudience('a').should.equal(true);
        })
      );

      it('should be true if user is in any specified audience group',
        inject(function ($security, $navigation) {
          $navigation.inAudience('a', 'b').should.equal(true);
        })
      );
    });
  });

  describe('isActiveLocation', function() {
    it('should be false if non-string is passed in',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.isActiveLocation().should.equal(false);
        $navigation.isActiveLocation(undefined).should.equal(false);
        $navigation.isActiveLocation(null).should.equal(false);
        $navigation.isActiveLocation({}).should.equal(false);
        $navigation.isActiveLocation([]).should.equal(false);
        $navigation.isActiveLocation(1).should.equal(false);
      })
    );

    it('should be false if empty or whitespace string is passed in',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.isActiveLocation('').should.equal(false);
        $navigation.isActiveLocation(' ').should.equal(false);
      })
    );

    it('should be false if the single part location is not active',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.isActiveLocation('/').should.equal(false);
        $navigation.isActiveLocation('/homer').should.equal(false);
        $navigation.isActiveLocation('/hom').should.equal(false);
        $navigation.isActiveLocation('homer').should.equal(false);
        $navigation.isActiveLocation('hom').should.equal(false);
      })
    );

    it('should be false if the multi-part location is not active',
      inject(function ($location, $navigation) {
        $location.path('/home/next');
        $location.path().should.match('/home/next');
        $navigation.isActiveLocation('/').should.equal(false);
        $navigation.isActiveLocation('/home/nex').should.equal(false);
        $navigation.isActiveLocation('/home/nexta').should.equal(false);
        $navigation.isActiveLocation('/homer/next').should.equal(false);
        $navigation.isActiveLocation('hom/nex').should.equal(false);
        $navigation.isActiveLocation('home/next/next').should.equal(false);
      })
    );

    it('should be true if the single part location is active',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.isActiveLocation('/home').should.equal(true);
        $navigation.isActiveLocation('home').should.equal(true);
      })
    );

    it('should be true if the multi-part location is active',
      inject(function ($location, $navigation) {
        $location.path('/home/next');
        $location.path().should.match('/home/next');
        $navigation.isActiveLocation('/home/next').should.equal(true);
        $navigation.isActiveLocation('home/next').should.equal(true);
      })
    );
  });

  describe('decorateLink', function() {
    it('should return the configured active decorator when the link is active',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.decorateLink('/home').should.equal('active-decorator');
      })
    );

    it('should return the configured inactive decorator when the link is inactive',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.decorateLink('/').should.equal('inactive-decorator');
      })
    );

    it('should return the provided active decorator when the link is active',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.decorateLink('/home', 'active-item', 'inactive-item').should.equal('active-item');
      })
    );

    it('should return the provided inactive decorator when the link is inactive',
      inject(function ($location, $navigation) {
        $location.path('/home');
        $location.path().should.match('/home');
        $navigation.decorateLink('/', 'active-item', 'inactive-item').should.equal('inactive-item');
      })
    );
  });
});
