'use strict';

var expect = require('chai').expect;

var authentication = require('./../../middleware/authentication');

describe('authentication middleware', function() {
  it('should load', function() {
    expect(authentication).to.be.a('object');
    expect(authentication.jwt).to.be.a('function');
    expect(authentication.requireAuthentication).to.be.a('function');
  });

  describe('jwt', function() {
    it('should decode the token', function(done) {
      var req = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjp7ImdpdmVuTmFtZSI6IiIsImZhbWlseU5hbWUiOiIifSwiaWQiOiJ0ZXN0LXVzZXItZWZnX3JhbmRvbV91dWlkIiwicmV2aXNpb24iOiIxLTE0NjgyMDUzMDkwNjkiLCJkZWxldGVkQXQiOm51bGwsImRlbGV0ZWRSZWFzb24iOiIiLCJ1c2VybmFtZSI6InRlc3QtdXNlciIsImVtYWlsIjoiIiwiZ3JhdmF0YXIiOiI5Y2I0Nzk4ODc0NTkzNTI5MjhkNDEyNmY4OTg0NTRjZiIsImRlc2NyaXB0aW9uIjoiIiwibGFuZ3VhZ2UiOiIiLCJoYXNoIjoiJDJhJDEwJDUxOWkxeW5lQkw0cEgzaVRNdG51b09hRjZkbnFDV041QmgxRDh1bzY4S3pRWTdEcklHeFlxIiwiY3JlYXRlZEF0IjoiMjAxNi0wNy0xMVQwMjo0ODoyOS4xNTVaIiwidXBkYXRlZEF0IjoiMjAxNi0wNy0xMVQwMjo0ODoyOS4xNTVaIiwiaWF0IjoxNDY4MjEyMTY3fQ.HCOkTzqR4v-vSSmoXqTS6vHnZPbgWaEDEL2T6iqzwTdnF58sm_ufnFMDmWfxWzBMc15Y--2oCSEhAPdTVfMqh_h4CSkqDNH10MSCrF346OKHLugFT3BUSuvE6NMszBnItBX8P2r7lc6hhLnpbI4lvslCfQNI3PCoQssbmT1IZ3k'
        },
        app: {
          locals: {}
        }
      };

      var res = {
        headers: {},
        set: function(header, value) {
          this.headers[header.toLowerCase()] = value;
        }
      };

      authentication.jwt(req, res, function(arg1, arg2, arg3, arg4) {
        expect(arg4).to.be.undefined;

        expect(req.user).to.deep.equal(req.app.locals.user);
        expect(req.user).to.deep.equal({
          name: {
            givenName: '',
            familyName: ''
          },
          id: 'test-user-efg_random_uuid',
          revision: req.user.revision,
          deletedAt: null,
          deletedReason: '',
          username: 'test-user',
          email: '',
          gravatar: req.user.gravatar,
          description: '',
          language: '',
          hash: req.user.hash,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
          iat: req.user.iat
        });

        expect(res.headers.authorization).equal(req.headers.authorization);

        done();
      });
    });
  });
});
