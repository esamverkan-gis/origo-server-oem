var orm = require('orm');
origoConfig = require('../conf/config');

module.exports = function(options) {
  // return function(req, res, next) {
  // Implement the middleware function based on the options object
  var connetionString = 'sqlite:' + origoConfig.adminDataBase.relativePath;

  // return orm.express("sqlite://C:/Users/imta/Sundsvall/OrigoDataBase/OrigoDataBase.db", {
  return orm.express(connetionString, {

    define: function(db, models, next) {
      var Group = db.define("groups", {
        name: String,
        title: String,
        parent: Number,
        expanded: Boolean,
        order_number: Number
      }, {
        methods: {
          createJsonObject: function() {
            let obj = {};
            obj.name = this.name;
            obj.title = this.title;
            if (this.parent) obj.parent = this.parent;
            obj.expanded = this.expanded;
            return obj;
          },
          // this method finds a layer (just any layer) that belongs to this group, then returns its config_id.
          // this way, we can simply get the config for each group's id! :)
          getConfig: function() {
            let that = this;
            return new Promise(function(resolve, reject) {
              Layer.find({ group_id: that.id }, function(err, layers) {
                if (err) reject();
                if (layers.length == 0) {
                  console.log('group ' + that.name + ' with id : ' + that.id + ' does not belong to any layer.');
                  reject('group ' + that.name + ' with id : ' + that.id + ' does not belong to any layer.');
                } else {
                  console.log(`group "${that.name}" with id : ${that.id} belongs to config : ${layers[0].config_id}`);
                  resolve(layers[0].config_id);
                }
              });
            });
          }
        },
        validations: {}
      });

      var Layer = db.define("layer", {
        name: String,
        name_id: String,
        title: String,
        format: String,
        queryable: Boolean,
        visible: Boolean,
        type: String,
        attribution: String,
        order_number: Number
      }, {
        methods: {
          createJsonObject: function() {
            let obj = {};
            obj.name = this.name;
            if (this.name_id) obj.id = this.name_id;
            obj.title = this.title;
            obj.format = this.format;
            obj.queryable = this.queryable;
            obj.visible = this.visible;
            obj.type = this.type;
            if (this.attribution) obj.attribution = this.attribution;
            return obj;
          }
        },
        validations: {}
      });

      var Source = db.define("source", {
        name: String,
        url: String,
        version: String
      }, {
        methods: {
          createJsonObject: function() {
            let obj = {};
            obj.url = this.url;
            obj.version = this.version;
            return obj;
          }
        },
        validations: {}
      });

      var Attribute = db.define("attribute", {
        name: String,
        title: String,
        url: String,
        url_title: String
      }, {
        methods: {},
        validations: {}
      });

      var Config = db.define("config", {
        name: String,
        projection_code: String,
        projection_extent: String,
        extent: String,
        center: String,
        zoom: Number,
        resolutions: String,
        featureinfo_options: Object
      }, {
        methods: {},
        validations: {}
      });

      var Control = db.define("control", {
        name: String,
        options: Object
      }, {
        methods: {
          createJsonObject: function() {
            let obj = {};
            obj.name = this.name;
            if (this.options) obj.options = this.options;
            return obj;
          }
        },
        validations: {}
      });

      /*var ControlOptions = db.define("controloptions", {
        content: String
      }, {
        methods: {},
        validations: {}
      });*/

      var Proj4Defs = db.define("proj4defs", {
        code: String,
        alias: String,
        projection: String
      }, {
        methods: {},
        validations: {}
      });

      var Style = db.define("style", {
        name: String,
        style_type: String,
        stroke_color: String,
        fill_color: String,
        width: Number,
        radius: Number,
        icon_source: String,
        sld_style: String,
        image_source: String,
        legend_is_multirow: Boolean
      }, {
        methods: {
          createJsonObject: function() {
            let obj = {};
            let styleType = this.style_type;
            if (styleType == 'stroke') {
              obj.stroke.color = this.stroke_color;
              obj.fill.color = this.fill_color;
            }
            if (styleType == 'circle') {
              obj.circle.radius = this.radius;
              obj.circle.stroke.color = this.stroke_color;
              obj.circle.stroke.width = this.width;
              obj.circle.fill.color = this.fill_color;
            }
            if (styleType == 'icon') {
              obj.icon = {};
              obj.icon.src = this.icon_source;
            }
            if (styleType == 'image') {
              7
              obj.image = {};
              obj.image.src = this.image_source;
            }
            if (this.legend_is_multirow) {
              obj.legendIsMultiRow = this.legend_is_multirow;
            }
            if (this.sld_style) {
              obj.sldStyle = this.sld_style;
            }
            return obj;
          }
        },
        validations: {}
      });

      Config.hasOne('proj4Defs', Proj4Defs);
      Control.hasOne('config', Config);
      // Control.hasOne('controlOptions', ControlOptions);
      Layer.hasOne('config', Config);
      Layer.hasOne('group', Group);
      Layer.hasOne('source', Source);
      Layer.hasOne('style', Style);
      Attribute.hasOne('layer', Layer);

      models.Group = Group;
      models.Layer = Layer;
      models.Source = Source;
      models.Attribute = Attribute;
      models.Config = Config;
      models.Control = Control;
      // models.ControlOptions = ControlOptions;
      models.Proj4Defs = Proj4Defs;
      models.Style = Style;
      models.db = db;

      console.log('from admin Router');
      next();
    }
  })
}
