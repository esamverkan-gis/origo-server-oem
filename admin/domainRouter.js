// all requests that start with "/admin/domain" is redirected to this module.

var express = require('express');
var domainRouter = express.Router();
var orm = require('orm');
var _ = require('lodash');

// req.models is a reference to models that ar defined in models.js and used as a middleware in admin.js

domainRouter.route('/fetchLayersAndGroups/:configId')
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .options(function (req, res, next) {
    res.sendStatus(200);
  })
  .get(function (req, res, next) {

    var Config = req.models.Config;
    var Group = req.models.Group;
    var Layer = req.models.Layer;
    var configId = req.params["configId"];

    var index = {};

    index.layers = [];
    index.groups = [];
    var groupsMap = new Map();

    var configPromise = new Promise(function (resolve, reject) {
      Config.find({ id: configId }, function (err, rows) {
        if (rows.length == 0) {
          res.end('No config for this id was found.');
          return;
        } else if (rows.length > 1) {
          res.end('More than one config for this id was found. Fix the database and remove duplicate data!');
          return;
        } else {
          var config = rows[0];
        }
        configId = config.id;
        index.projectionCode = config.projection_code;
        index.projectionExtent = config.projection_extent.split(',').map(Number);
        index.extent = config.extent.split(',').map(Number);
        index.center = config.center.split(',').map(Number);
        index.resolutions = config.resolutions.split(',').map(Number);
        index.zoom = config.zoom;
        index.featureInfoOptions = config.featureinfo_options;
        config.getProj4Defs(function (err, proj4Defs) {
          index.proj4Defs = [{
            "code": proj4Defs.code,
            "alias": proj4Defs.alias,
            "projection": proj4Defs.projection
          }];
          resolve();
        });
      });
    });

    configPromise.then(function () {

      let layersPromise = new Promise(function (resolve, reject) {
        Layer.find({ config_id: configId }, function (err, layers) {

          console.log('Number of layers   : ' + layers.length);
          var layersPromises = [];
          for (let layer of layers) {
            layersPromises.push(new Promise(function (resolve, reject) {

              // let layerJsonObj = layer.createJsonObject();

              let groupsPromise = function () {
                return new Promise(function (resolve, reject) {
                  layer.getGroup(function (err, group) {
                    if (group) {  // in practice all layers must have a group, but in the test environment there might be 
                      // layers without groups. in this case group is undefined and we need to check that.
                      // layerJsonObj.group = group.name;
                      groupsMap.set(group.name, group);
                      // groupsMap.set(group.name, group.createJsonObject());
                    }
                    resolve();
                  });
                });
              }

              groupsPromise().then(function () {
                // index.layers.push(layerJsonObj);
                index.layers.push(layer);
                resolve();
              });
            }));
          }
          Promise.all(layersPromises).then(function () {
            for (let group of groupsMap.values()) {
              index.groups.push(group);
            }
            resolve();
          });
        });
      });

      Promise.all([layersPromise]).then(function () {
        console.log('Number of groups   : ' + groupsMap.size);
        console.log('done!');
        res.setHeader('Content-disposition', 'attachment; filename=index.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).json(index);
      }).catch(function (error) {
        console.log(error);
        res.status(500).json(error.message);
      });
    });
  });

domainRouter.route('/test/:configId')
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .options(function (req, res, next) {
    res.sendStatus(200);
  })
  .get(function (req, res, next) {
    console.log('test working!');
    var configId = req.params["configId"];

    req.models.Layer.find({ config_id: configId }, function (err, layers) {

      var layer = layers[0];

      var promise = new Promise(function (resolve, reject) {
        layer.getGroup(function (err, group) {
          resolve();
        })
      });

      promise.then(function () {
        res.send(layer);
      });
    });

  });

// this method fetches all groups for a config that has at least one layer.
// empty groups will not be returned 
domainRouter.route('/fetchConfigNotEmptyGroups/:configId')
  .all(function (req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .options(function (req, res, next) {
    res.sendStatus(200);
  })
  .get(function (req, res, next) {

    var Config = req.models.Config;
    var Group = req.models.Group;
    var Layer = req.models.Layer;
    var configId = req.params["configId"];

    var index = {};

    index.layers = [];
    index.groups = [];
    var groupsMap = new Map();

    var configPromise = new Promise(function (resolve, reject) {
      Config.find({ id: configId }, function (err, rows) {
        if (rows.length == 0) {
          res.end('No config for this id was found.');
          return;
        } else if (rows.length > 1) {
          res.end('More than one config for this id was found. Fix the database and remove duplicate data!');
          return;
        } else {
          var config = rows[0];
        }
        configId = config.id;
        // index.projectionCode = config.projection_code;
        // index.projectionExtent = config.projection_extent.split(',').map(Number);
        // index.extent = config.extent.split(',').map(Number);
        // index.center = config.center.split(',').map(Number);
        // index.resolutions = config.resolutions.split(',').map(Number);
        // index.zoom = config.zoom;
        // index.featureInfoOptions = config.featureinfo_options;
        config.getProj4Defs(function (err, proj4Defs) {
          if (proj4Defs)
            index.proj4Defs = [{
              "code": proj4Defs.code,
              "alias": proj4Defs.alias,
              "projection": proj4Defs.projection
            }];
          resolve();
        });
      });
    });

    configPromise.then(function () {

      let layersPromise = new Promise(function (resolve, reject) {
        Layer.find({ config_id: configId }, function (err, layers) {

          // console.log('Number of layers   : ' + layers.length);
          var layersPromises = [];
          for (let layer of layers) {
            layersPromises.push(new Promise(function (resolve, reject) {

              // let layerJsonObj = layer.createJsonObject();

              let groupsPromise = function () {
                return new Promise(function (resolve, reject) {
                  layer.getGroup(function (err, group) {
                    if (group) {  // in practice all layers must have a group, but in the test environment there might be 
                      // layers without groups. in this case group is undefined and we need to check that.
                      // layerJsonObj.group = group.name;
                      groupsMap.set(group.name, group);
                      // groupsMap.set(group.name, group.createJsonObject());
                    }
                    resolve();
                  });
                });
              }

              groupsPromise().then(function () {
                // index.layers.push(layerJsonObj);
                index.layers.push(layer);
                resolve();
              });
            }));
          }
          Promise.all(layersPromises).then(function () {
            for (let group of groupsMap.values()) {
              index.groups.push(group);
            }
            resolve();
          });
        });
      });

      Promise.all([layersPromise]).then(function () {
        console.log('Number of groups that belongs to the configId ' + configId + ' : ' + groupsMap.size);
        console.log('done!');
        res.setHeader('Content-disposition', 'attachment; filename=index.json');
        res.setHeader('Content-type', 'application/json');
        res.status(200).json(index.groups);
      }).catch(function (error) {
        console.log(error);
        res.status(500).json(error.message);
      });
    });
  });

module.exports = domainRouter;