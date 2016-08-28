'use strict';

var debug = require('debug')('routes:codebase');
var express = require('express');
var router = express.Router();

var CodeBase = require('./../models/codebase').CodeBase;
var CodeBases = require('./../models/codebases').CodeBases;

/**
 * Ensure the identifier is a plausible github slug
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function validateIdentifier(req, res, next) {
  debug('looking up ', req.params.identifier);

  if (req.params.identifier.indexOf('/') === -1) {
    var err = new Error('Invalid GitHub slug should be format owner/repo');
    err.status = 400;
    return next(err);
  }

  req.app.locals.codebase = new CodeBase({
    id: req.params.identifier
  });
  debug('added codebase to req ', req.app.locals);

  next();
}

/**
 * Get a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function getCodeBase(req, res, next) {
  req.app.locals.codebase
    .fetch()
    .then(function() {
      res.json(req.app.locals.codebase.toJSON());
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
  // TODO calculate complexity
  req.app.locals.codebase.complexificationity = Math.random();

  req.app.locals.codebase
    .save()
    .then(function() {
      res.json(req.app.locals.codebase.toJSON());
    })
    .catch(next);
}

/**
 * Update a codebase's details
 * @param  {Request} req
 * @param  {Response} res
 * @param  {Function} next
 */
function putCodeBase(req, res, next) {
  req.app.locals.codebase
    .fetch()
    .then(function() {
      // TODO re-calculate complexity

      codebase
        .save()
        .then(function() {
          res.json(req.app.locals.codebase.toJSON());
        })
        .catch(next);
    })
    .catch(next);
}

router.get('/', getList);
router.get('/:identifier', validateIdentifier, getCodeBase);
router.post('/:identifier', validateIdentifier, postCodeBase);
router.put('/:identifier', validateIdentifier, putCodeBase);

module.exports.getCodeBase = getCodeBase;
module.exports.postCodeBase = postCodeBase;
module.exports.putCodeBase = putCodeBase;

module.exports.getList = getList;
module.exports.router = router;
