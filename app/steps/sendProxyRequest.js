'use strict';

var chunkLength = require('../../lib/chunkLength');

function sendProxyRequest(Container) {
  var req = Container.user.req;
  var bodyContent = Container.proxy.bodyContent;
  var reqOpt = Container.proxy.reqBuilder;
  var options = Container.options;

  return new Promise(function(resolve, reject) {
    var protocol = Container.proxy.requestModule;
    var proxyReq = protocol.request(reqOpt, function(rsp) {
      var chunks = [];
      rsp.on('data', function(chunk) { chunks.push(chunk); });
      rsp.on('end', function() {
        Container.proxy.res = rsp;
        Container.proxy.resData = Buffer.concat(chunks, chunkLength(chunks));
        resolve(Container);
      });
      rsp.on('error', reject);
    });

    proxyReq.on('socket', function(socket) {
      if (options.timeout) {
        socket.setTimeout(options.timeout, function() {
          proxyReq.abort();
        });
      }
    });

    proxyReq.on('error', reject);

    // this guy should go elsewhere, down the chain
    if (options.parseReqBody) {
    // We are parsing the body ourselves so we need to write the body content
    // and then manually end the request.

      //if (bodyContent instanceof Object) {
        //throw new Error
        //debugger;
        //bodyContent = JSON.stringify(bodyContent);
      //}

      if (bodyContent.length) {
        proxyReq.write(bodyContent);
      }
      proxyReq.end();
    } else {
    // Pipe will call end when it has completely read from the request.
      req.pipe(proxyReq);
    }

    req.on('aborted', function() {
    // reject?
      proxyReq.abort();
    });
  });
}


module.exports = sendProxyRequest;
