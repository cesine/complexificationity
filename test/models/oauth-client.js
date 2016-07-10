'use strict';

var expect = require('chai').expect;

var OAuthClient = require('./../../models/oauth-client');
var OAuthToken = require('./../../models/oauth-token');
var User = require('./../../models/user');

describe('oauth client model', function() {
  var client = {
    id: 'test-client',
    client_id: 'test-client',
    client_secret: 'test-secret'
  };
  var user = {
    id: 'test-user-efg_random_uuid',
    username: 'test-user',
    password: 'aje24wersdfgs324rfe+woe',
    name: {
      familyName: 'Test'
    }
  };
  var token = {
    access_token: 'test-token',
    access_token_expires_on: new Date(1468108856432),
    refresh_token: 'test-refresh',
    refresh_token_expires_on: new Date(1468108856432),
    client_id: client.client_id,
    user_id: user.id
  };

  before(function(done) {
    OAuthClient.init();
    User.init();
    OAuthToken.init();

    setTimeout(function() {
      OAuthClient.create(client, function(err, result) {
        User.create(user, function(err, result) {
          OAuthToken.create(token, function(err, result) {
            done();
          });
        });
      });
    }, 300);
  });

  describe('persistance', function() {
    it('should create a OAuthClient', function(done) {
      var json = {
        client_secret: '29j3werd',
        extranious: 123
      };

      OAuthClient.create(json, function(err, client) {
        if (err) {
          return done(err);
        }

        expect(client.client_id).length(36);
        expect(client).to.deep.equal({
          client_id: client.client_id,
          client_secret: '29j3werd',
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        });

        done();
      });
    });

    it('should return null if client not found', function(done) {
      OAuthClient
        .read({
          client_id: 'test-nonexistant-client'
        }, function(err, client) {
          if (err) {
            return done(err);
          }

          expect(client).to.be.null;

          done();
        });
    });

    describe('existing OAuthClients', function() {
      it('should look up a client using id and secret', function(done) {
        OAuthClient
          .read({
            client_id: 'test-client',
            client_secret: 'test-secret'
          }, function(err, client) {
            if (err) {
              return done(err);
            }

            expect(client).not.to.be.null;

            expect(client).to.deep.equal({
              client_id: 'test-client',
              client_secret: 'test-secret',
              contact: null,
              title: null,
              description: null,
              hour_limit: null,
              day_limit: null,
              throttle: null,
              redirect_uri: null,
              deletedAt: null,
              deleted_reason: null,
              createdAt: client.createdAt,
              updatedAt: client.updatedAt
            });

            done();
          });
      });

      it('should look up using id', function(done) {
        OAuthClient
          .read({
            client_id: 'test-client',
          }, function(err, client) {
            if (err) {
              return done(err);
            }

            expect(client).not.to.be.null;
            expect(client.client_id).equal('test-client');

            done();
          });
      });
    });
  });

  describe('collection', function() {
    beforeEach(function(done) {
      OAuthClient
        .create({
          client_id: 'testm-abc',
          title: 'Puppies app'
        }, function() {
          OAuthClient
            .create({
              client_id: 'testm-hij',
              deletedAt: new Date(1341967961140),
              deleted_reason: 'spidering on July 9 2012'
            }, function() {
              done();
            });
        });
    });

    it('should list an admin view of all clients', function(done) {
      OAuthClient.list({
        where: {
          client_id: {
            $like: 'testm-%'
          }
        },
        limit: 1000
      }, function(err, clients) {
        if (err) {
          return done(err);
        }

        expect(clients).not.to.deep.equal([]);
        expect(clients).length(2);

        var client = clients[0];
        expect(client.client_id).to.exist;
        expect(client.title).to.exist;
        expect(client.deleted_reason).to.be.null;

        done();
      });
    });

    it('should list an admin view of deactivated clients', function(done) {
      OAuthClient.list({
        where: {
          deleted_reason: {
            $like: '%spider%'
          }
        },
        limit: 1000
      }, function(err, clients) {
        if (err) {
          return done(err);
        }

        expect(clients).not.to.deep.equal([]);
        expect(clients).length(1);

        var client = clients[0];
        expect(client.client_id).to.exist;
        expect(client.deleted_reason).to.exist;

        done();
      });
    });
  });

  // https://github.com/oauthjs/node-oauth2-server/wiki/Model-specification
  describe('express-oauth-server support', function() {
    describe('tokens', function() {
      it('should save an access token', function(done) {
        OAuthClient.saveAccessToken(token, client, user, function(err, token) {
          if (err) {
            return done(err);
          }

          expect(token).not.to.be.null;
          expect(token).deep.equal({
            access_token: token.access_token,
            client_id: 'test-client',
            access_token_expires_on: token.expires,
            refresh_token: token.refresh_token,
            refresh_token_expires_on: token.expires,
            user_id: user.id
          });

          done();
        });
      });

      it('should get an access token', function(done) {
        OAuthClient.getAccessToken('test-token', function(err, token) {
          if (err) {
            return done(err);
          }

          expect(token).not.to.be.null;
          expect(token).deep.equal({
            accessToken: 'test-token',
            clientId: 'test-client',
            expires: token.expires,
            userId: 'test-user-efg_random_uuid'
          });

          done();
        });
      });

      it('should get an refresh token', function(done) {
        OAuthClient.getRefreshToken('test-refresh', function(err, token) {
          if (err) {
            return done(err);
          }

          expect(token).not.to.be.null;
          expect(token).deep.equal({
            accessToken: 'test-token',
            clientId: 'test-client',
            expires: token.expires,
            userId: 'test-user-efg_random_uuid'
          });

          done();
        });
      });
    });

    describe('clients', function() {
      it('should get a client', function(done) {
        OAuthClient.getClient('test-client', 'test-secret', function(err, client_info) {
          if (err) {
            return done(err);
          }

          expect(client_info).not.to.be.null;
          expect(client_info).deep.equal({
            clientId: 'test-client',
            clientSecret: 'test-secret'
          });

          done();
        });
      });
    });

    describe('users', function() {
      it('should get a user', function(done) {
        OAuthClient.getUser('test-user', 'aje24wersdfgs324rfe+woe', function(err, userId) {
          if (err) {
            return done(err);
          }

          expect(userId).not.to.be.null;
          expect(userId).equal('test-user-efg_random_uuid');

          done();
        });
      });
    });
  });
});
