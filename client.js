var PROTO_PATH = __dirname + '/xkcd.proto';

var grpc = require('grpc');
var xkcd_proto = grpc.load(PROTO_PATH).xkcd;

function main() {
  var client = new xkcd_proto.XkcdGrabber('localhost:50051',
                                          grpc.credentials.createInsecure());

  client.getLatestUrl({}, function(err, response) {
    if (err) {
      console.log(err.message);
    } else {
      console.log('latest: ', response);
    }
  });
  setTimeout(()=>{
    client.getRandomUrl({}, function(err, response) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('random: ', response);
      }
    });
  }, 500);
  setTimeout(()=>{
    client.getNextUrl({}, function(err, response) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('next: ', response);
      }
    });
  }, 1000);
  setTimeout(()=>{
    client.getPreviousUrl({offset:12}, function(err, response) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('previous: ', response);
      }
    });
  }, 1500);

}

main();
