'use strict';

var expect = require('chai').expect;

var OauthToken = require('./../../models/oauth-token');

describe('oauth token model', function() {
  describe('persistance', function() {
    before(function() {
      OauthToken.init();
    });

    it('should create a OauthToken', function(done) {
      var json = {
        access_token: 'test-' + Date.now(),
        access_token_expires_on: new Date(Date.now() + 1 * 60 * 60 * 1000),
        refresh_token: '23waejsowj4wejsrd',
        refresh_token_expires_on: new Date(Date.now() + 1 * 60 * 60 * 1000),
        client_id: 'acme123',
        user_id: 'abc21234efg'
      };

      OauthToken.create(json, function(err, token) {
        if (err) {
          return done(err);
        }

        expect(token.id).length(36);
        expect(token).to.deep.equal({
          id: token.id,
          access_token: json.access_token,
          access_token_expires_on: json.access_token_expires_on,
          client_id: json.client_id,
          refresh_token: json.refresh_token,
          refresh_token_expires_on: json.refresh_token_expires_on,
          user_id: json.user_id,
          updatedAt: token.updatedAt,
          createdAt: token.createdAt
        });

        done();
      });
    });

    it('should return null if OauthToken not found', function(done) {
      OauthToken
        .read({
          access_token: 'test-nonexistant-OauthToken'
        }, function(err, token) {
          if (err) {
            return done(err);
          }

          expect(token).to.be.null;

          done();
        });
    });

    describe('existing OauthTokens', function() {
      before(function(done) {
        OauthToken
          .create({
            access_token: 'test-token',
            access_token_expires_on: new Date(1468108856432),
            refresh_token: 'test-refresh',
            refresh_token_expires_on: new Date(1468108856432),
            client_id: 'test-client',
            user_id: 'test-user-efg_random_uuid'
          }, function() {
            done();
          });
      });

      it('should look up an access token', function(done) {
        OauthToken
          .read({
            access_token: 'test-token'
          }, function(err, token) {
            if (err) {
              return done(err);
            }

            expect(token.access_token).equal('test-token');
            expect(token.refresh_token).equal('test-refresh');
            expect(token.client_id).equal('test-client');
            expect(token.user_id).equal('test-user-efg_random_uuid');

            expect(token.access_token_expires_on instanceof Date).true;
            expect(token.refresh_token_expires_on instanceof Date).true;

            expect(JSON.stringify(token.access_token_expires_on)).equal('"2016-07-10T00:00:56.432Z"');

            done();
          });
      });

      it('should look up an refresh token', function(done) {
        OauthToken
          .read({
            refresh_token: 'test-refresh'
          }, function(err, token) {
            if (err) {
              return done(err);
            }

            expect(token.access_token).equal('test-token');
            expect(token.refresh_token).equal('test-refresh');

            done();
          });
      });
    });
  });

  describe('collection', function() {
    beforeEach(function(done) {
      var user = {
        id: 'test-user'
      };

      var client = {
        id: 'test-client'
      };

      OauthToken
        .read({
          access_token: 'testm-abc'
        }, function(err, token) {
          if (token) {
            return done();
          }
          OauthToken
            .create({
              access_token: 'testm-abc',
              client_id: 'test-client',
              user_id: 'test-user'
            }, function() {
              OauthToken
                .create({
                  access_token: 'testm-efg',
                  client_id: 'test-client',
                  user_id: 'test-user'
                }, function() {
                  OauthToken
                    .create({
                      access_token: 'testm-hij',
                      client_id: 'test-client',
                      user_id: 'test-user'
                    }, function() {
                      done();
                    });
                });
            });
        });
    });

    it('should list an admin view of all tokens', function(done) {
      OauthToken.list({
        where: {
          access_token: {
            $like: 'testm-%'
          }
        },
        limit: 1000
      }, function(err, tokens) {
        if (err) {
          return done(err);
        }

        expect(tokens).not.to.deep.equal([]);
        expect(tokens).length(3);

        var token = tokens[0];
        expect(token.access_token).to.exist;
        expect(token.client_id).to.exist;
        expect(token.user_id).to.exist;
        expect(token.deleted_reason).to.be.null;

        done();
      });
    });
  });
});
