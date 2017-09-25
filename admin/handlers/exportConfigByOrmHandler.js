// This module reads a conifg from database and creates a full index.json

"use strict";

var orm = require('orm');

var exportConfigByOrm = function(req, res) {

  var Group = req.models.Group;
  var Layer = req.models.Layer;
  var Source = req.models.Source;
  var Attribute = req.models.Attribute;
  var Config = req.models.Config;
  var Control = req.models.Control;
  // var ControlOptions = req.models.ControlOptions;
  var Proj4Defs = req.models.Proj4Defs;
  var Style = req.models.Style;

  // var configName = req.params["configName"];
  var configId = req.params["configId"];
  var configId;
  var index = {};
  index.controls = [];
  index.layers = [];

  index.groups = [];
  var groupsMap = new Map();
  index.source = {};
  var sourcesMap = new Map();
  index.styles = {};
  var stylesMap = new Map();

  var configPromise = new Promise(function(resolve, reject) {
    // Config.find({ name: configName }, function(err, rows) {
    Config.find({ id: configId }, function(err, rows) {
      if (rows.length == 0) {
        res.end('No config for this name was found.');
        return;
      } else if (rows.length > 1) {
        res.end('More than one config for this name was found. Fix the database and remove duplicate data!');
        return;
      } else {
        var config = rows[0];
      }
      configId = config.id;
      index.configName = config.name;
      index.projectionCode = config.projection_code;
      index.projectionExtent = config.projection_extent.split(',').map(Number);
      index.extent = config.extent.split(',').map(Number);
      index.center = config.center.split(',').map(Number);
      index.resolutions = config.resolutions.split(',').map(Number);
      index.zoom = config.zoom;
      index.featureInfoOptions = config.featureinfo_options;
      config.getProj4Defs(function(err, proj4Defs) {
        index.proj4Defs = [{
          "code": proj4Defs.code,
          "alias": proj4Defs.alias,
          "projection": proj4Defs.projection
        }];
        resolve();
      });
    });
  });

  configPromise.then(function() {
    // it is also possible to use config.getControls() method if we say Control.hasOne('config', Config, {reverse: 'control'}).
    let controlsPromise = new Promise(function(resolve, reject) {
      Control.find({ config_id: configId }, function(err, controls) {

        console.log('Number of controls : ' + controls.length);
        for (let control of controls) {
          index.controls.push(control.createJsonObject());
        }
        resolve();
      });
    });

    let layersPromise = new Promise(function(resolve, reject) {
      Layer.find({ config_id: configId }, function(err, layers) {

        console.log('Number of layers   : ' + layers.length);
        var layersPromises = [];
        for (let layer of layers) {
          layersPromises.push(new Promise(function(resolve, reject) {

            let layerJsonObj = layer.createJsonObject();

            let groupsPromise = function() {
              return new Promise(function(resolve, reject) {
                layer.getGroup(function(err, group) {
                  layerJsonObj.group = group.name;
                  groupsMap.set(group.name, group.createJsonObject());
                  // index.groups.push(group.createJsonObject());
                  resolve();
                });
              });
            }

            let sourcePromise = function() {
              return new Promise(function(resolve, reject) {
                layer.getSource(function(err, source) {
                  layerJsonObj.source = source.name;
                  index.source[source.name] = source.createJsonObject();
                  sourcesMap.set(source.name, source.createJsonObject());
                  resolve();
                });
              });
            }

            let stylePromise = function() {
              return new Promise(function(resolve, reject) {
                layer.getStyle(function(err, style) {
                  layerJsonObj.style = style.name;
                  let arr = [];
                  arr[0] = [];
                  arr[0].push(style.createJsonObject());
                  index.styles[style.name] = arr;
                  stylesMap.set(style.name, style.createJsonObject());
                  resolve();
                });
              });
            }

            let attributePromise = function() {
              return new Promise(function(resolve, reject) {
                Attribute.find({ layer_id: layer.id }, function(err, attributes) {
                  if (attributes.length > 0) {
                    layerJsonObj.attributes = [];
                    for (let attribute of attributes) {
                      let attJsonObj = {};
                      if (attribute.name) attJsonObj.name = attribute.name;
                      if (attribute.title) attJsonObj.title = attribute.title;
                      if (attribute.url) attJsonObj.url = attribute.url;
                      if (attribute.url_title) attJsonObj.urltitle = attribute.url_title;
                      layerJsonObj.attributes.push(attJsonObj);
                    }
                  }
                  resolve();
                });
              });
            }

            Promise.all([groupsPromise(), sourcePromise(), stylePromise(), attributePromise()]).then(function() {
              index.layers.push(layerJsonObj);
              resolve();
            });

          }));
        }
        Promise.all(layersPromises).then(function() {
          for (let group of groupsMap.values()) {
            index.groups.push(group);
          }
          resolve();
        });
      });
    });

    Promise.all([controlsPromise, layersPromise]).then(function() {
      console.log('Number of groups   : ' + groupsMap.size);
      console.log('Number of sources  : ' + sourcesMap.size);
      console.log('Number of styles   : ' + stylesMap.size);
      console.log('done!');
      res.setHeader('Content-disposition', 'attachment; filename=index.json');
      res.setHeader('Content-type', 'application/json');  
      res.status(200).json(index);
    }).catch(function(error) {
      console.log(error);
      res.status(500).json(error.message);
    });
  });
}

module.exports = exportConfigByOrm;
