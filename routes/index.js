'use strict';

var express = require('express');
var router = express.Router();

/* GET healthcheck. */

router.get('/healthcheck', function(req, res) {
  res.json({
    ok: true
  });
});

module.exports.router = router;
