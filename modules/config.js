const config = require("../config.json");

const defaults = {
  "server": {
    "port": 3000,
    "name": "Debategory",
    "language": "en",
    "autoLanguage": true
  },
  "speechlist": {
    "defaultLists": [
      "Main List",
      "Secondary List"
    ]
  }
}

function setDefaults(defs, parent=config) {
  var objs = {};
  for (var parameter in defs) {
    if (typeof defs[parameter] == "object" && !Array.isArray(defs[parameter])) {
      objs[parameter] = setDefaults(defs[parameter], config[parameter]);
    } else {
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
