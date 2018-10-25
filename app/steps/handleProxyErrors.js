'use strict';

var debug = require('debug')('express-http-proxy');

function connectionResetHandler(err, res) {
  if (err && err.code === 'ESOCKETTIMEDOUT') {
    debug('Error: Connection reset due to author-set timeout option.');
    res.setHeader('X-Timeout-Reason', 'express-http-proxy reset the request.');
    res.writeHead(504, {'Content-Type': 'text/plain'});
    res.end();
  }
}

function handleProxyErrors(err, res, next) {
  switch (err && err.code) {
    case 'ESOCKETTIMEDOUT':  { return connectionResetHandler(err, res, next); }
    default:                 { next(err); }
  }
}

module.exports = handleProxyErrors;
