// all requests that start with "/admin" is redirected to this module.

var express = require('express');
var adminRouter = express.Router();
// var orm = require('orm');
// models are defined in models.js and used as a middleware for all queries that come through "/admin".
// models are available for handlers on req.models
var models = require('../admin/models.js');

var configRouter = require('../admin/configRouter.js');
var groupRouter = require('../admin/groupRouter.js');
var sourceRouter = require('../admin/sourceRouter.js');
var layerRouter = require('../admin/layerRouter.js');

// loading models for orm, options are arbitrary
adminRouter.use(models({ /*option1: '1', option2: '2' */ }));

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

//*********************************************************************ExportConfig********************************************************************
// read data from database and create index.json 
var exportConfigByOrmHandler = require('../admin/handlers/exportConfigByOrmHandler');
adminRouter.get('/exportConfig/:configName', exportConfigByOrmHandler);

//********************************************************************importConfig********************************************************************************
// read the index.json from body, form the corresponding objects and save them in the database
var importConfigByOrmHandler = require('../admin/handlers/importConfigByOrmHandler');
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