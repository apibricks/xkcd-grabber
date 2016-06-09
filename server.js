var grpc = require('grpc');
var request = require('request');
var Promise = require('promise');

var xkcd_proto = grpc.load('/api/main.proto').xkcd;

var last_viewed_post = -1;


// HELPER FUNCTIONS
function getURLForComicNumber(number) {
  return 'http://xkcd.com/' + number + '/info.0.json';
}

function getDetailsForURL(url) {
  return new Promise(function(fulfill, reject) {
    request({
      url: url,
      json: true
    }, function(error, response, body) {
      if (error) reject(error);
      else fulfill(body);
    });
  });
}

function getLatestXkcdNumber() {
  return new Promise(function(fulfill, reject) {
    getDetailsForURL('http://xkcd.com/info.0.json').then((result)=> {
      fulfill(result.num);
    }, (err)=>{
      reject(err);
    });
  });
}

function getForURL(call, callback, url) {
  getDetailsForURL(url).then((result)=> {
      callback(null, {url:result.img});
      last_viewed_post = result.num;
    }, (err)=> {
     callback({code: grpc.status.INTERNAL, details: err});
   });
}


// RPC METHODS
function getLatestUrl(call, callback) {
  getForURL(call, callback, 'http://xkcd.com/info.0.json');
}

function getRandomUrl(call, callback) {
  getLatestXkcdNumber().then((number)=>{
    number = Math.floor(Math.random() * number + 1);
    getForURL(call, callback, getURLForComicNumber(number));
  }, (err)=>{
    callback({code: grpc.status.INTERNAL, details: err});
  });
}

function getNextUrl(call, callback) {
  var offset = call.request.offset || 1;
  if (last_viewed_post === -1) {
    callback({code: grpc.status.INTERNAL, details: 'No last viewed post'});
  } else {
    getLatestXkcdNumber().then((number)=>{
      if (last_viewed_post + offset > number) {
        callback({code: grpc.status.INTERNAL,
                  details: 'This post has not been published yet'});
      } else {
        getForURL(call, callback, getURLForComicNumber(last_viewed_post + offset));
      }
    }, (err)=>{
      callback({code: grpc.status.INTERNAL, details: err});
    });
  }
}

function getPreviousUrl(call, callback) {
  var offset = call.request.offset || 1;
  if (last_viewed_post === -1) {
    callback({code: grpc.status.INTERNAL, details: 'No last viewed post'});
  } else if (last_viewed_post - offset < 1) {
    callback({code: grpc.status.INTERNAL,
              details: 'There are no posts with negative numbers'});
  } else {
    getForURL(call, callback, getURLForComicNumber(last_viewed_post - offset));
  }
}

var server = new grpc.Server();
server.addProtoService(xkcd_proto.XkcdGrabber.service, {
  getRandomUrl: getRandomUrl,
  getLatestUrl: getLatestUrl,
  getNextUrl: getNextUrl,
  getPreviousUrl: getPreviousUrl,
});

server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
