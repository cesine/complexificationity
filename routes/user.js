'use strict';

var debug = require('debug')('routes:user');
var express = require('express');
var router = express.Router();

var User = require('./../models/user');
var authenticationMiddleware = require('./../middleware/authentication');

// Initialize the model to ensure the table exists
User.init();

/**
 * Get a user's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getUser(req, res, next) {
  var json = {
    username: req.params.username
  };

  User.read(json, function(err, profile) {
    if (err) {
      return next(err, req, res, next);
    }
    res.json(profile);
  });
}

/**
 * Get a list of users
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getList(req, res, next) {
  User.list(null, function(err, miniProfiles) {
    if (err) {
      return next(err, req, res, next);
    }
    res.json(miniProfiles);
  });
}

/**
 * Update a user's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function putUser(req, res, next) {
  var json = {
    username: req.params.username
  };

  if (req.params.username !== req.body.username || req.params.username !== req.app.locals.user.username){
    debug(req.params, req.body);
    var err = new Error('Username does not match, you can only update your own details');
    err.status = 403;

    return next(err, req, res, next);
  }

  User.save(req.body, function(err, profile) {
    if (err) {
      return next(err, req, res, next);
    }
    res.json(profile);
  });
}

router.get('/', getList);
router.get('/:username', authenticationMiddleware.requireAuthentication, getUser);
router.put('/:username', authenticationMiddleware.requireAuthentication, putUser);

module.exports.getUser = getUser;
module.exports.putUser = putUser;

module.exports.getList = getList;
module.exports.router = router;
