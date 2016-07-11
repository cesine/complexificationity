'use strict';

var expect = require('chai').expect;

var User = require('./../../models/user');

describe('user model', function() {
  before(function() {
    return User.init();
  });

  describe('serialization', function() {
    it('should convert flat to json', function() {
      var flat = {
        username: 'test-abc',
        givenName: 'abc'
      };

      var json = User.serialization.flatToJson(flat, '');

      expect(json).to.deep.equal({
        name: {
          givenName: 'abc',
          familyName: ''
        },
        id: '',
        revision: '',
        deletedAt: null,
        deletedReason: '',
        description: '',
        email: '',
        hash: '',
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

      var flat = User.serialization.jsonToFlat(json, '');

      expect(flat).to.deep.equal({
        givenName: 'abc',
        familyName: '',
        revision: '',
        deletedAt: null,
        deletedReason: '',
        description: '',
        email: '',
        hash: '',
        gravatar: '',
        language: '',
        username: 'test-abc'
      });
    });
  });

  describe('persistance', function() {
    before(function() {
      return User.init();
    });

    it('should create a user', function(done) {
      var json = {
        username: 'test-' + Date.now(),
        password: '7hfD!hujoijK',
        name: {
          familyName: 'Test'
        }
      };

      User.create(json, function(err, profile) {
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
        expect(profile.hash).length(60);
        expect(profile.deletedAt).to.be.null;

        done();
      });
    });

    it('should require a password', function(done) {
      var json = {
        username: 'test-deficient' + Date.now()
      };

      User.create(json, function(err) {
        expect(err.message).equal('Please provide a password which is 8 characters or longer');

        done();
      });
    });

    it('should ignore invalid revisions', function(done) {
      var json = {
        username: 'test-deficient' + Date.now(),
        password: 'a390j3qawoeszidj',
        name: {},
        revision: 'notanexpectedtrevision'
      };

      User.create(json, function(err, profile) {
        if (err) {
          return done(err);
        }

        expect(profile.id).length(36);

        expect(profile.revision).to.be.defined;
        expect(profile.revision).not.equal('notanexpectedtrevision');

        done();
      });
    });

    it('should accept a client side user', function(done) {
      var json = {
        id: 'aa9e1e0042client984created95uuid' + Date.now(),
        revision: '3-' + (Date.now() - 14 * 1000 * 1000),
        username: 'test-' + Date.now(),
        password: 'a390j3qawoeszidj',
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

      User.create(json, function(err, profile) {
        if (err) {
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
          deletedAt: null,
          deletedReason: '',
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
          hash: profile.hash,
          // dates will be the db dates
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt
        });

        done();
      });
    });

    it('should save a new user', function(done) {
      var json = {
        username: 'test-abc' + Date.now(),
        password: 'a390j3qawoeszidj',
        name: {}
      };

      User.save(json, function(err, profile) {
        if (err) {
          return done(err);
        }

        expect(profile.id).length(36);
        expect(profile.username).to.equal(json.username);
        expect(profile.name.givenName).to.equal('');
        expect(profile.createdAt).to.be.defined;
        expect(profile.updatedAt).to.be.defined;
        expect(profile.revision).to.be.defined;
        expect(profile.deletedAt).to.be.null;

        done();
      });
    });

    it('should return null if user not found', function(done) {
      User.read('test-nonexistant-user', function(err, profile) {
        if (err) {
          return done(err);
        }

        expect(profile).to.be.null;

        done();
      });
    });

    describe('existing users', function() {
      beforeEach(function(done) {
        User.save({
          username: 'test-efg',
          password: 'a390j3qawoeszidj',
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
        User.read({
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
            deletedAt: null,
            deletedReason: '',
            username: 'test-efg',
            description: 'Friendly',
            email: '',
            hash: profile.hash,
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
          password: 'a390j3qawoeszidj',
          name: {
            givenName: 'Albert',
            familyName: ''
          },
          language: 'ko'
        };
        User.save(json, function(err, profile) {
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
            deletedAt: null,
            deletedReason: '',
            username: 'test-efg',
            // should not overwrite previous values if patch is missing
            description: 'Friendly',
            email: '',
            hash: profile.hash,
            gravatar: profile.gravatar,
            language: 'ko',
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt
          });

          done();
        });
      });

      describe('deletion', function() {
        var userToDelete = {
          username: 'test-delete' + Date.now(),
          password: 'a390j3qawoeszidj',
          name: {}
        };

        before(function(done) {
          User.create(userToDelete, function() {
            done();
          });
        });

        it('should require a user', function(done) {
          User.flagAsDeleted(null, function(err) {
            expect(err.message).equal('Please provide a username and a deletedReason');

            done();
          });
        });

        it('should require a username', function(done) {
          User.flagAsDeleted({}, function(err) {
            expect(err.message).equal('Please provide a username and a deletedReason');

            done();
          });
        });

        it('should require a reason', function(done) {
          User.flagAsDeleted({
            username: 'test-deleted' + Date.now()
          }, function(err) {
            expect(err.message).equal('Please provide a username and a deletedReason');

            done();
          });
        });

        it('should warn if the user doesnt exist', function(done) {
          User.flagAsDeleted({
            username: 'test-deleted' + Date.now(),
            deletedReason: 'for testing purposes'
          }, function(err) {
            expect(err.message).equal('Cannot delete user which doesn\'t exist');

            done();
          });
        });

        it('should flag user as deleted', function(done) {
          User.flagAsDeleted({
            username: userToDelete.username,
            deletedReason: 'for testing purposes'
          }, function(err, user) {
            if (err) {
              return done(err);
            }

            expect(user.deletedReason).equal('for testing purposes');
            expect(user.deletedAt.toDateString()).equal(new Date().toDateString());

            done();
          });
        });
      });
    });
  });

  describe('password', function() {
    var userWithPassword = {
      username: 'test-password',
      name: {
        givenName: 'Test',
        familyName: 'Password'
      },
      password: 'zKmmfweLj2!h'
    };

    before(function(done) {
      User.init();
      User.create(userWithPassword, function() {
        done();
      });
    });

    it('should reply with invalid username and password', function() {
      var hashed = User.hashPassword('123ioiw3we_!');

      expect(hashed.hash).length(60);
      expect(hashed.salt).length(29);
    });

    it('should reply with invalid username and password', function(done) {
      User.verifyPassword({
        username: 'test-nonexistant-user',
        password: '123ioiw3we_!'
      }, function(err) {
        expect(err.message).equal('User not found');

        done();
      });
    });

    it('should reply with invalid username and password', function(done) {
      User.verifyPassword({
        username: userWithPassword.username,
        password: 'anotherpassword'
      }, function(err) {
        expect(err.message).equal('Invalid password');

        done();
      });
    });

    it('should recognize the password', function(done) {
      User.verifyPassword({
        username: userWithPassword.username,
        password: 'zKmmfweLj2!h'
      }, function(err, profile) {
        if (err) {
          return done(err);
        }

        expect(profile.username).equal(userWithPassword.username);

        done();
      });
    });
  });

  describe('collection', function() {
    beforeEach(function(done) {
      User.save({
        username: 'yoan oct',
        password: 'zKmmfweLj2!h',
        name: {},
      }, function() {
        User.save({
          username: 'alex oct',
          password: 'zKmmfweLj2!h',
          name: {},
          email: ''
        }, function() {
          User.save({
            username: 'noemi oct',
            password: 'zKmmfweLj2!h',
            name: {},
            email: 'noemi@example.com'
          }, function() {
            done();
          });
        });
      });
    });

    it('should list a public view of all users', function(done) {
      User.list({
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

    it('should return empty lists', function(done) {
      User.list({
        where: {
          username: {
            $like: '%unlikely'
          }
        },
        limit: 1000
      }, function(err, users) {
        if (err) {
          return done(err);
        }

        expect(users).to.deep.equal([]);
        expect(users).length(0);

        done();
      });
    });
  });
});
