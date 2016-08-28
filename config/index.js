var fs = require('fs');

var config = {
  url: 'https://localhost:8010',
  ssl: {
    key: fs.readFileSync(__dirname + '/ssl_debug.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/ssl_debug.crt', 'utf8')
  }
};

module.exports = config;
