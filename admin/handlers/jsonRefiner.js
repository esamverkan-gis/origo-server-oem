"use strict";

var _ = require('lodash');

/*
  layers parsed with xmlParser have a special format that is values for each property sits in an array! 
  for example "name" : ["skolor"]
  this module makes proper json objects. 
*/

var Layer = function(geoServerLayer) {

  if (geoServerLayer.hasOwnProperty('Name')) this.name = geoServerLayer.Name[0];
  if (geoServerLayer.hasOwnProperty('Title')) this.title = geoServerLayer.Title[0];
  if (geoServerLayer.hasOwnProperty('Abstract')) this.abstract = geoServerLayer.Abstract[0];
  if (geoServerLayer.hasOwnProperty('CRS')) this.CRS = geoServerLayer.CRS[0];
  if (geoServerLayer.hasOwnProperty('id')) this.id = geoServerLayer.id[0];
  if (geoServerLayer.hasOwnProperty('format')) this.format = geoServerLayer.format[0];
  if (geoServerLayer.hasOwnProperty('$')) {
    if (geoServerLayer.$.hasOwnProperty('queryable')) this.queryable = setTrueOrFalse(geoServerLayer.$.queryable);
  }
}

function setTrueOrFalse(value) {
  if (value == 0) return false;
  else return true;
}

// var counter = 1;
var Attribute = function(geoServerAttribute) {

  var path = 'xsd:schema.xsd:complexType[0].xsd:complexContent[0].xsd:extension[0].xsd:sequence[0].xsd:element';
  if (_.has(geoServerAttribute, path)) {
    var elements = _.get(geoServerAttribute, path);
    var attArray = [];
    for (let element of elements) {
      attArray.push(element.$);
    }
    return attArray;
    
    // console.log(counter++);
  } else if (_.has(geoServerAttribute, 'ows:ExceptionReport')) {
    return {
      message : 'no attributes was available for this layer, or server has another format than (request=DescribeFeatureType&typename=layerName)'
    }
  } else {
    return {
      message : 'provided path to the elements did not exist. (propably map server is using another version)'
    }
  }
}

module.exports.Layer = Layer;
module.exports.Attribute = Attribute;

/*
format of response from geoserver is like this before it is converted to JSON:

<xsd:schema xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:sok="http://botkyrka.se/sok" xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified" targetNamespace="http://botkyrka.se/sok">
<xsd:import namespace="http://www.opengis.net/gml/3.2" schemaLocation="http://decerno-geo01.redbridge.se:80/geoserver/schemas/gml/3.2.1/gml.xsd"/>
  <xsd:complexType name="adress_sokType">
    <xsd:complexContent>
      <xsd:extension base="gml:AbstractFeatureType">
        <xsd:sequence>
          <xsd:element maxOccurs="1" minOccurs="0" name="adress" nillable="true" type="xsd:string"/>
          <xsd:element maxOccurs="1" minOccurs="0" name="the_geom" nillable="true" type="gml:PointPropertyType"/>
        </xsd:sequence>
      </xsd:extension>
    </xsd:complexContent>
  </xsd:complexType>
<xsd:element name="adress_sok" substitutionGroup="gml:AbstractFeature" type="sok:adress_sokType"/>
</xsd:schema>
*/