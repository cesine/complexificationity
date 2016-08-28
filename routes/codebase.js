'use strict';

var debug = require('debug')('routes:codebase');
var express = require('express');
var router = express.Router();

var CodeBase = require('./../models/codebase').CodeBase;
var CodeBases = require('./../models/codebases').CodeBases;

/**
 * Get a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getCodeBase(req, res, next) {
  debug('looking up ', req.params.identifier);

  if (req.params.identifier.indexOf('/') === -1) {
    var err = new Error('Invalid GitHub slug should be format owner/repo');
    err.status = 400;
    return next(err);
  }

  var codebase = new CodeBase({
    id: req.params.identifier
  });

  codebase
    .fetch()
    .then(function() {
      res.json(codebase.toJSON());
    })
    .catch(next);
}

/**
 * Get a list of codebases
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getList(req, res, next) {
  CodeBases.list()
    .then(function(list) {
      res.json(list);
    })
    .catch(next);
}

/**
 * Calculate a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function postCodeBase(req, res, next) {
  var json = {
    identifier: req.params.identifier
  };

  res.json(json);
}

/**
 * Update a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function putCodeBase(req, res, next) {
  var json = {
    identifier: req.params.identifier
  };

  res.json(json);
}

router.get('/', getList);
router.get('/:identifier', getCodeBase);
router.post('/:identifier', postCodeBase);
router.put('/:identifier', putCodeBase);

module.exports.getCodeBase = getCodeBase;
module.exports.postCodeBase = postCodeBase;
module.exports.putCodeBase = putCodeBase;

module.exports.getList = getList;
module.exports.router = router;
