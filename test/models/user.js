'use strict';

var expect = require('chai').expect;

var user = require('./../../models/user');

describe('user model', function() {
  before(function() {
    return user.init();
  });

  describe('serialization', function() {
    it('should convert flat to json', function() {
      var flat = {
        username: 'test-abc',
        givenName: 'abc'
      };

      var json = user.serialization.flatToJson(flat, '');

      expect(json).to.deep.equal({
        name: {
          givenName: 'abc',
          familyName: ''
        },
        id: '',
        revision: '',
        deleted: null,
        description: '',
        email: '',
        gravatar: '',
        language: '',
        username: 'test-abc'
      });
    });

    it('should convert json to flat', function() {
      var json = {
        username: 'test-abc',
        name: {
          givenName: 'abc'
        },
        extraneous: 'will be removed from flat'
      };

      var flat = user.serialization.jsonToFlat(json, '');

      expect(flat).to.deep.equal({
        givenName: 'abc',
        familyName: '',
        revision: '',
        deleted: null,
        description: '',
        email: '',
        gravatar: '',
        language: '',
        username: 'test-abc'
      });
    });
  });

  describe('persistance', function() {
    before(function() {
      return user.init();
    });

    it('should create a user', function(done) {
      var json = {
        username: 'test-' + Date.now(),
        name: {
          familyName: 'Test'
        }
      };

      user.create(json, function(err, profile) {
        if (err) {
          return done(err);
        }

        expect(profile.id).length(36);
        expect(profile.createdAt instanceof Date).to.be.true;
        expect(profile.createdAt).to.equal(profile.updatedAt);

        expect(profile.id).length(36);
        expect(profile.username).to.equal(json.username);
        expect(profile.name.givenName).to.equal('');
        expect(profile.name.familyName).to.equal('Test');
        expect(profile.createdAt).to.be.defined;
        expect(profile.updatedAt).to.be.defined;
        expect(profile.revision).to.be.defined;
        expect(profile.deleted).to.be.null;

        done();
      });
    });

    it('should accept a client side user', function(done) {
      var json = {
        id: 'aa9e1e0042client984created95uuid' + Date.now(),
        revision: '3-' + (Date.now() - 14 * 1000 * 1000),
        username: 'test-' + Date.now(),
        name: {
          familyName: 'Test'
        },
        language: 'ko',
        email: 'example@example.com',
        gravatar: 'previouslydeterminedstring',
        description: '<script src="http://haha.com/cleanme"></script>',
        // extra fields will be scrubbed
        extraneous: 'some other stuff from the client side that wont be persisted',
        createdAt: new Date() - 30 * 1000 * 1000,
        updatedAt: new Date() - 14 * 1000 * 1000
      };

      user.create(json, function(err, profile) {
        if (err) {
          console.log(err.stack);
          return done(err);
        }

        expect(profile.id).length(45);
        expect(profile.createdAt instanceof Date).to.be.true;
        expect(profile.createdAt).to.equal(profile.updatedAt);

        var revisionNumber = parseInt(profile.revision.split('-')[0], 10);
        expect(revisionNumber).to.equal(4);

        expect(profile).to.deep.equal({
          id: json.id,
          revision: profile.revision,
          deleted: null,
          username: json.username,
          // content wont be sanitized
          description: '<script src=\"http://haha.com/cleanme\"></script>',
          email: 'example@example.com',
          // wont be over written
          gravatar: 'previouslydeterminedstring',
          name: {
            givenName: '',
            familyName: 'Test'
          },
          language: 'ko',
          // dates will be the db dates
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        });

        done();
      });
    });

    it('should save a new user', function(done) {
      var json = {
        username: 'test-abc',
        name: {}
      };

      user.save(json, function(err, profile) {
        if (err) {
          return done(err);
        }

        expect(profile.id).length(36);
        expect(profile.username).to.equal(json.username);
        expect(profile.name.givenName).to.equal('');
        expect(profile.createdAt).to.be.defined;
        expect(profile.updatedAt).to.be.defined;
        expect(profile.revision).to.be.defined;
        expect(profile.deleted).to.be.null;

        done();
      });
    });

    it('should return null if user not found', function(done) {
      user
        .read('test-nonexistant-user', function(err, profile) {
          if (err) {
            return done(err);
          }

          expect(profile).to.be.null;

          done();
        });
    });

    describe('existing users', function() {
      beforeEach(function(done) {
        user
          .save({
            username: 'test-efg',
            name: {
              givenName: 'Anony',
              familyName: 'Mouse'
            },
            description: 'Friendly',
            language: 'zh'
          }, function() {
            done();
          });
      });

      it('should read an existing user', function(done) {
        user
          .read({
            username: 'test-efg'
          }, function(err, profile) {
            if (err) {
              return done(err);
            }

            expect(profile).to.deep.equal({
              name: {
                givenName: 'Anony',
                familyName: 'Mouse'
              },
              id: profile.id,
              revision: profile.revision,
              deleted: null,
              username: 'test-efg',
              description: 'Friendly',
              email: '',
              gravatar: profile.gravatar,
              language: 'zh',
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt
            });

            done();
          });
      });

      it('should update a user', function(done) {
        var json = {
          username: 'test-efg',
          name: {
            givenName: 'Albert',
            familyName: ''
          },
          language: 'ko'
        };
        user
          .save(json, function(err, profile) {
            if (err) {
              return done(err);
            }

            var revisionNumber = parseInt(profile.revision.split('-')[0], 10);
            expect(typeof revisionNumber).to.equal('number');

            expect(profile).to.deep.equal({
              name: {
                givenName: 'Albert',
                // should overwrite values if patch is specified
                familyName: ''
              },
              id: profile.id,
              revision: profile.revision,
              deleted: null,
              username: 'test-efg',
              // should not overwrite previous values if patch is missing
              description: 'Friendly',
              email: '',
              gravatar: profile.gravatar,
              language: 'ko',
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt
            });

            done();
          });
      });
    });
  });

  describe('collection', function() {
    beforeEach(function(done) {
      user
        .save({
          username: 'yoan oct',
          name: {},
        }, function() {
          user
            .save({
              username: 'alex oct',
              name: {},
              email: ''
            }, function() {
              user
                .save({
                  username: 'noemi oct',
                  name: {},
                  email: 'noemi@example.com'
                }, function() {
                  done();
                });
            });
        });
    });
    it('should list a public view of all users', function(done) {
      user.list({
        where: {
          username: {
            $like: '%oct'
          }
        },
        limit: 1000
      }, function(err, users) {
        if (err) {
          return done(err);
        }

        expect(users).not.to.deep.equal([]);
        expect(users).length(3);

        done();
      });
    });
  });
});
