'use strict';

var express = require('express');
var path = require('path');
var router = express.Router();

var User = require('./../models/user');

/**
 * Render UI pages
 */
router.use('/', express.static(__dirname + '/../public/components/as-ui-auth/components'));

/**
 * Log in
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function postLogin(req, res, next) {
  User.verifyPassword({
    password: req.body.password,
    username: req.body.username
  }, function(err, user) {
    if (err) {
      err.status = 403;
      // return getLogin(req, res, next);
      return next(err, req, res, next);
    }
    // Successful logins should send the user back to /oauth/authorize.
    var path = req.body.redirect || '/home';

    return res.redirect(util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
  });
}

router.post('/login', postLogin);

module.exports.postLogin = postLogin;
module.exports.router = router;
