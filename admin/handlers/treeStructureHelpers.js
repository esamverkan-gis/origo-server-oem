function updateTreeStructure(req, res) {

  const data = JSON.parse(req.body.data);
  const node = data.node;
  const nextParentNode = data.nextParentNode;
  const nextSiblings = data.nextSiblings;
  const nextParentNodeName = nextParentNode.name === 'ROOT' ? null : nextParentNode.name;

  // Finding layers with the same next parent and updating their order_number
  req.models.Layer.find({ group_id: nextParentNode.id, config_id: nextParentNode.config_id }).each(function (layer) {
    nextSiblings.forEach((ns, index) => {
      if (ns.type && ns.id == layer.id) {
        layer.order_number = index;
      }
    });
  }).save(function (err) {
    if (err) console.log(err);
  });

  // Finding groups with the same next parent and updating their order_number
  req.models.Group.find({ parent: nextParentNodeName, config_id: nextParentNode.config_id }).each(function (group) {
    nextSiblings.forEach((ns, index) => {
      if (!ns.type && ns.id == group.id) {
        group.order_number = index;
      }
    });
  }).save(function (err) {
    if (err) console.log(err);
  });

  if (node.type) { // node is a layer
    // Finding node layer itself and updating its order_number and parent.
    req.models.Layer.find({ id: node.id, config_id: node.config_id }).each(function (layer) {
      nextSiblings.forEach((ns, index) => {
        if (ns.type && ns.id == layer.id) {
          layer.order_number = index;
          layer.group_id = nextParentNode.id;
        }
      });
    }).save(function (err) {
      if (err) console.log(err);
    });

  } else { // node is a group
    // Finding node group itself and updating its order_number and parent.
    req.models.Group.find({ id: node.id, config_id: node.config_id }).each(function (group) {
      nextSiblings.forEach((ns, index) => {
        if (!ns.type && ns.id == group.id) {
          group.order_number = index;
          group.parent = nextParentNodeName;
        }
      });
    }).save(function (err) {
      if (err) console.log(err);
    });
  }
}

module.exports = updateTreeStructure;