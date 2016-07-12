var fs = require('fs');

var config = {
  url: 'https://localhost:8010',
  jwt: {
    algorithm: 'RS256',
    prefix: 'v1/',
    private: fs.readFileSync(__dirname + '/jwt_debug.pem', 'utf8'),
    public: fs.readFileSync(__dirname + '/jwt_debug.pub', 'utf8')
  },
  ssl: {
    key: fs.readFileSync(__dirname + '/ssl_debug.key', 'utf8'),
    cert: fs.readFileSync(__dirname + '/ssl_debug.crt', 'utf8')
  }
};

module.exports = config;
