'use strict';

var expect = require('chai').expect;
var supertest = require('supertest');

var service = require('./../../');

describe('/authenticate', function() {
  it('should load', function() {
    expect(service).to.be.a('function');
  });

  describe('login', function() {
    it.only('should display', function(done) {
      supertest(service)
        .get('/authenticate/login')
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          expect(res.text).to.contain('Login');
          expect(res.text).to.contain('button');
          expect(res.text).to.contain('Password');

          done();
        });
    });

    it('should login', function(done) {
      supertest(service)
        .post('/authenticate/login')
        // .json({
        //   username: 'test-user',
        //   password: 'aje24wersdfgs324rfe+woe'
        // })
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          console.log(res, body);

          done();
        });
    });
  });
});
