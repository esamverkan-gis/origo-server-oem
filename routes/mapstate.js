// all requests that start with "/mapstate" is redirected to this module.

var fs = require("fs");
const uuidV4 = require('uuid/v4');
origoConfig = require('../conf/config');
var express = require('express');
var mapstateRouter = express.Router();

mapstateRouter.use(function(req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

/* GET start page. */
mapstateRouter.get('/', function(req, res) {
  res.render('index');
});

mapstateRouter.post('/', function(req, res) {
  //TODO CLean data!!!
  var mapstateId = uuidV4();
  var stateObject = req.body;

  fs.writeFile(getFileName(mapstateId), JSON.stringify(req.body), function(err) {
    res.end(JSON.stringify({ "mapStateId": mapstateId }));
  });
});

mapstateRouter.get('/:mapstateId', function(req, res) {
  //TODO: SANITY CHECK AND ALL THAT STUFF   
  var mapstateId = req.params["mapstateId"];
  fs.readFile(getFileName(mapstateId), function(err, data) {
    res.end(data);
  });
});

function getFileName(mapstateId) {
  if (typeof mapstateId == "undefined") {
    throw Exception("mapstateId is not defined");
  }
  if (!origoConfig) {
    throw "No configuration found for server";
  }
  if (!origoConfig.mapState || !origoConfig.mapState.absolutePathStorage || origoConfig.mapState.absolutePathStorage.length == 0) {
    throw "No path for storing mapState found in configuration";
  }
  var storageDir = origoConfig.mapState.absolutePathStorage;
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir);
  }
  return fileName = storageDir + "/" + "mapstate-" + mapstateId + ".json";
}

module.exports = mapstateRouter;
