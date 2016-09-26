var https = require('https');
var AWS = require('aws-sdk');
var cf = require('aws-cloudfront-sign');
var s3 = new AWS.S3();
var moment = require('moment');
var keyPairId = "abc";

function getS3(bucket, key){
  var params = {
    Bucket: bucket,
    Key: key
  };
  return s3.getObject(params).promise();
}

function getJSON(url) {
    var p = new Promise(function(resolve, reject){
        https.get(url, function(response) {
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                resolve(JSON.parse(body));
            });
            response.on('error', function(err){
                reject(err);
            });
        });
    });
    return p;
}

exports.handler = (event, context, callback) => {
    var tokenInfoUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + event.Logins['accounts.google.com'];
    getJSON(tokenInfoUrl).then(function(data){
      if(!data.email.endsWith('@ocelotconsulting.com')){
        throw new Error('Access denied');
      }
    })
    .then(function(){
      return getS3('ocelot-consulting-wp', `keys/pk-${keyPairId}.pem.txt`);
    })
    .then(function(pk){
      var options = {keypairId: `${keyPairId}`, privateKeyString: pk.Body.toString(), expireTime: moment().add(1, 'day')}
      callback(null, cf.getSignedCookies(`http*://${keyPairId}.cloudfront.net/*``, options));
    })
    .catch(function(err){
      console.log('error', err);
      callback(err);
    });
};
