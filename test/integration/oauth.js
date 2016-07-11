'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var service = require('./../../');

describe('/oauth', function() {
  describe('POST /oauth/token', function() {
    it('should validate the authorization code', function(done) {
      supertest(service)
        .post('/oauth/token')
        .send('client_id=test-client&client_secret=test-secret' +
          '&grant_type=authorization_code&username=test-user&code=ABC')
        .expect(403)
        .expect('Content-Type', 'application/json; charset=utf-8')
        // .expect({
        //   access_token: 'foobar',
        //   token_type: 'bearer'
        // })
        .end(function(err, res) {
          if (err) throw err;

          expect(res.body).to.deep.equal({
            error: res.body.error,
            status: 403,
            message: 'Code is not authorized'
          });

          done();
        });
    });
  });
});
