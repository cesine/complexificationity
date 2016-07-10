'use strict';

var express = require('express');
var path = require('path');
var util = require('util');

var User = require('./../models/user');

var router = express.Router();

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
      // send client side json which can be displayed to the user
      return next(err, req, res, next);
    }
    // Successful logins should send the user back to /oauth/authorize.
    var path = req.body.redirect || 'oauth/authorize/as';

    return res.redirect(util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
  });
}

router.post('/login', postLogin);

module.exports.postLogin = postLogin;
module.exports.router = router;
