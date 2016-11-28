'use strict';

var express = require('express');
var router = express.Router();

/* GET healthcheck. */

router.get('/healthcheck', function(req, res) {
  res.json({
    ok: true
  });
});

/* GET UI. */
router.use('/', express.static(__dirname + '/../public/components/complexificationity-ui/build'));

module.exports.router = router;
