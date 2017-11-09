// all requests that start with "/admin" is redirected to this module.

var express = require('express');
var adminRouter = express.Router();
const fileUpload = require('express-fileupload');
const app = express();
 
// default options 
adminRouter.use(fileUpload());

// var orm = require('orm');
// models are defined in models.js and used as a middleware for all queries that come through "/admin".
// models are available for handlers on req.models
var models = require('../admin/models.js');

var configRouter = require('../admin/configRouter.js');
var groupRouter = require('../admin/groupRouter.js');
var sourceRouter = require('../admin/sourceRouter.js');
var layerRouter = require('../admin/layerRouter.js');
var styleRouter = require('../admin/styleRouter.js');
var attributeRouter = require('../admin/attributeRouter.js');
var domainRouter = require('../admin/domainRouter.js');
var proj4defsRouter = require('../admin/proj4defsRouter');

// loading models for orm, options are arbitrary
adminRouter.use(models({ /*option1: '1', option2: '2' */ }));
adminRouter.use(function (req, res, next) {

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

// handlers 
// a handler is just a function that takes req, res and handles it!

/* GET start page. */
adminRouter.get('/', function(req, res) {
  res.render('index');
});

adminRouter.use('/config', configRouter);
adminRouter.use('/group', groupRouter);
adminRouter.use('/source', sourceRouter);
adminRouter.use('/layer', layerRouter);
adminRouter.use('/style', styleRouter);
adminRouter.use('/attribute', attributeRouter);
adminRouter.use('/proj4defs', proj4defsRouter);
adminRouter.use('/domain', domainRouter);

//*********************************************************************ExportConfig********************************************************************
// read data from database and create index.json 
var exportConfigByOrmHandler = require('../admin/handlers/exportConfigByOrmHandler');
// adminRouter.get('/exportConfig/:configName', exportConfigByOrmHandler);
adminRouter.get('/exportConfig/:configId', exportConfigByOrmHandler);

//********************************************************************importConfig********************************************************************************
// read the index.json from body, form the corresponding objects and save them in the database
var importConfigByOrmHandler = require('../admin/handlers/importConfigByOrmHandler');
adminRouter.options('/importConfig',function (req, res, next) {
    res.sendStatus(200);
});
adminRouter.post('/importConfig', importConfigByOrmHandler);

// *************************************************************************getCapabilities*************************************************************************
/*
Example source urls from index.json:
+ https://extmaptest.sundsvall.se/service/gwc/geoserver/wms
+ http://extmaptest.sundsvall.se/geoserver/wms
+ http://maps3.sgu.se/geoserver/ows
- http://gis-services.metria.se/arcgis/rest/services/msb/InspireMSB_Oversvamning_Oversiktliga/MapServer/exts/InspireView/service?(there are layers under main layer! V:1.3.0)
- http://nvpub.vic-metria.nu/arcgis/services/Naturvardsregistret/MapServer/WmsServer?(there are layers under main layer! V:1.3.0)
+ http://geo-netinfo.trafikverket.se/MapService/wms.axd/NetInfo?SERVICE=WMS&
+ http://extmaptest.sundsvall.se/geoserver/wfs
+ https://extmap.sundsvall.se:443/geoserver/gwc/service/wms?SERVICE=WMS&
+ http://extmaptest.sundsvall.se/geoserver/wms
*/
var getLayersFromCapabilitiesHandler = require('../admin/handlers/getLayersFromCapabilitiesHandler');
adminRouter.get('/getLayersFromCapabilities', getLayersFromCapabilitiesHandler);

module.exports = adminRouter;
