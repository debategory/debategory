const config = require("../config.json");

const defaults = {
  "server": {
    "port": 3000,
    "language": "en"
  },
  "lists": [
    "Hauptantrag",
    "Änderungsantrag"
  ]
}

function setDefaults(defs, parent=config) {
  var objs = {};
  for (var parameter in defs) {
    if (typeof defs[parameter] == "object" && !Array.isArray(defs[parameter])) {
      objs[parameter] = setDefaults(defs[parameter], config[parameter]);
    } else {
      //console.log(parameter, defs[parameter]);
      if (typeof parent[parameter] != "undefined") {
        objs[parameter] = parent[parameter];
      } else {
        objs[parameter] = defs[parameter];
      }
    }
  }
  return objs;
}

module.exports = setDefaults(defaults);
