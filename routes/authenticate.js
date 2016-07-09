'use strict';

var express = require('express');
var router = express.Router();

/**
 * Render login page
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getLogin(req, res, next) {
  return render('login', {
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri
  });
}

/**
 * Log in
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function postLogin(req, res, next) {
    // @TODO: Insert your own login mechanism.
  if (req.body.email !== 'thom@nightworld.com') {
    return render('login', {
      redirect: req.body.redirect,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri
    });
  }

  // Successful logins should send the user back to /oauth/authorize.
  var path = req.body.redirect || '/home';

  return res.redirect(util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
}

router.get('/login', postLogin);
router.post('/login', getLogin);

module.exports.getLogin = getLogin;
module.exports.postLogin = postLogin;
module.exports.router = router;
