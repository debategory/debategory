const i18n = require("i18n"),
      config = require("./config.js");

i18n.configure({
  locales:["en", "de", "nl"],
  directory: "locale"
});

module.exports = function(req, res, next) {
  i18n.init(req, res);
  res.setLocale(req.app.locals.locale);
  return next();
};
