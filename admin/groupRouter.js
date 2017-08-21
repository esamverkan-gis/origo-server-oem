// all requests that start with "/admin/group" is redirected to this module.

var express = require('express');
var groupRouter = express.Router();
var orm = require('orm');
var _ = require('lodash');

//*********************************************************************CRUD group*********************************************************************
// req.models is a reference to models that ar defined in models.js and used as a middleware in admin.js
groupRouter.get('/', function(req, res) {
  var searchStr = req.query.search;
  var groupName = req.query.name;
  // OBS! name=someName takes precedence over search, if name query exists search will have no effect
  if (groupName)
    req.models.Group.find({ name: groupName }, function(err, groups) {
      if (groups.length == 0)
        res.sendStatus(404);
      else
        res.status(200).json(groups);
    });
  else if (searchStr)
    req.models.Group.find({ name: orm.like("%" + searchStr + "%") }, function(err, groups) {
      console.log('Number of groups fetched that match the search query "' + searchStr + '" : ' + groups.length);
      if (groups.length == 0)
        res.sendStatus(404);
      else
        res.status(200).json(groups);
    });
  else if (_.isEmpty(req.query))
    req.models.Group.find(function(err, groups) {
      console.log('Number of all groups fetched : ' + groups.length);
      if (groups.length == 0)
        res.sendStatus(404);
      else
        res.status(200).json(groups);
    });
  else
    res.sendStatus(400);
});

groupRouter.post('/', function(req, res) {
  const newGroup = req.body;
  req.models.Group.create(newGroup, function(err, group) {
    if (err) {
      console.log(err.message);
      res.status(500).send(err.message);
    } else
      res.status(201).send('New group saved with id : ' + group.id);
  });
});

groupRouter.route('/:id')
  .all(function(req, res, next) {
    // runs for all HTTP verbs first
    // think of it as route specific middleware!
    next();
  })
  .get(function(req, res, next) {
    req.models.Group.find({ id: req.params.id }, function(err, groups) {
      if (groups.length == 0)
        res.sendStatus(404);
      else {
        groups[0].getConfig().then(function(configId) {
          // config id for this group is available here. (ready for later use!)
          res.status(200).json(groups);
        }).catch(function() {
          // even if promise for finding the config is rejected, we are still interested in groups, so we return them anyway!
          res.status(200).json(groups);
        });
      }
    });
  })
  .put(function(req, res, next) {
    let newGroup = req.body;
    req.models.Group.get(req.params.id, function(err, group) {
      if (!group) res.sendStatus(404);
      else {
        Object.assign(group, newGroup);
        group.save(function(err) {
          if (err) res.sendStatus(500);
          else res.sendStatus(200);
        });
      }
    })
  })
  .post(function(req, res, next) {
    res.sendStatus(400);
  })
  .delete(function(req, res, next) {
    req.models.Group.get(req.params.id, function(err, group) {
      if (!group) res.sendStatus(404);
      else group.remove(function(err) {
        if (err) res.sendStatus(500);
        else res.sendStatus(200);
      });
    });
  });

module.exports = groupRouter;