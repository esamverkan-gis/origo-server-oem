"use strict";

const URL = require('url');
var http = require('http');
var https = require('https');

// this method takes a url, sends the request and returns the xml document as result
// no processing on the result is done here, so it can be used to fetch any kind of data that is in xml format.
var fetchData = function(url) {
  var url = URL.parse(url);
  if (url.protocol == 'http:')
    return new Promise(function(resolve, reject) {
      http.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
        } else if (!contentType.includes('xml') && !contentType.includes('XML')) {
          error = new Error('Invalid content-type.\n' +
            `Expected text/xml but received ${contentType}`);
        }
        if (error) {
          // console.error(error.message);
          // consume response data to free up memory
          res.resume();
          reject(error);
          return;
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve(rawData);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        reject(e);
      });
    });

  if (url.protocol == 'https:')
    return new Promise(function(resolve, reject) {
      https.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
        } else if (!contentType.includes('xml') && !contentType.includes('XML')) {
          error = new Error('Invalid content-type.\n' +
            `Expected text/xml but received ${contentType}`);
        }
        if (error) {
          // console.error(error.message);
          // consume response data to free up memory
          res.resume();
          reject(error);
          return;
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve(rawData);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        reject(e);
      });
    });
}

var fixUrlforGetCapabilities = function(url) {
  var urlString = url;
  var fixedUrl = '';
  if (urlString.endsWith('?')) {
    fixedUrl = urlString + 'request=getcapabilities';
    if (!urlString.includes('service=wms') && !urlString.includes('SERVICE=WMS'))
      fixedUrl = fixedUrl + '&service=wms';

  } else if (urlString.includes('?')) {
    fixedUrl = urlString + '&request=getcapabilities';
    if (!urlString.includes('service=wms') && !urlString.includes('SERVICE=WMS'))
      fixedUrl = fixedUrl + '&service=wms';

  } else {
    fixedUrl = urlString + '?request=getcapabilities';
    if (!urlString.includes('service=wms') && !urlString.includes('SERVICE=WMS'))
      fixedUrl = fixedUrl + '&service=wms';
  }
  console.log(fixedUrl);
  return fixedUrl;
}

var fixUrlforDescribeFeaturType = function(url, layerName) {
  var urlString = url;
  var fixedUrl = '';
  if (urlString.endsWith('?')) {
    fixedUrl = urlString + 'request=DescribeFeatureType&typename=' + layerName;
  } else if (urlString.includes('?')) {
    fixedUrl = urlString + '&request=DescribeFeatureType&typename=' + layerName;
  } else {
    fixedUrl = urlString + '?request=DescribeFeatureType&typename=' + layerName;
  }
  if (fixedUrl.includes('geoserver/wms')) {
    fixedUrl = fixedUrl.replace('geoserver/wms', 'geoserver/wfs');
  }
  return fixedUrl;
}

/*app.get('/admin/ogctest', function(req, res) {
  // this is a convinient way of parsing an OGC GetCapabilities Document to JSON with nodejs
  // q=http://extmaptest.sundsvall.se/geoserver/wms?request=getcapabilities
  if (req.query) {
    //set method from req
    console.log(req.method);
    var options = {
      method: req.method,
      url: req.query.q,
      headers: {
        'User-Agent': 'opendispatcher'
      },
      timeout: 20000 //6 seconds
    };
    var request = require('request');
    x = request(options);
    x.on('response', function(response) {
      var data = [];
      response.on('data', function(chunk) {
        data.push(chunk);
      });
      response.on('end', function() {
        var finaldata = data.join('');
        var xml2js = require('xml2js');
        var parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, stripPrefix: true });
        parser.parseString(finaldata, function(err, result) {
          if (err) {
            console.log(err);
            res.end();
          } else {
            res.json(result);
          }
        });
      });
    });
    x.on('error', function(err) {
      res.status(400).json({
        "error": "Timeout on proxy"
      });
    });
  } else {
    res.status(400).json({
      "error": "wrong use of proxy"
    });
  }
});*/

module.exports.fetchData = fetchData;
module.exports.fixUrlforGetCapabilities = fixUrlforGetCapabilities;
module.exports.fixUrlforDescribeFeaturType = fixUrlforDescribeFeaturType;
