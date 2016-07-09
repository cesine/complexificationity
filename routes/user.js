'use strict';
var express = require('express');
var router = express.Router();

var user = require('./../models/user');

// Initialize the model to ensure the table exists
user.init();

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

  user.read(json, function(err, profile) {
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
  user.list(null, function(err, miniProfiles) {
    if (err) {
      return next(err, req, res, next);
    }
    res.json(miniProfiles);
  });
}

router.get('/', getList);
router.get('/:username', getUser);

module.exports.getUser = getUser;
module.exports.getList = getList;
module.exports.router = router;
