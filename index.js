const express  = require("express"),
      app      = express(),
      path     = require("path"),
      passport = require("passport"),
      session  = require("express-session"),
      flash    = require("express-flash"),
      http     = require("http").createServer(app),
      io       = require("socket.io")(http),
      twig     = require("twig"),
      config   = require("./modules/config.js"),
      routes   = require("./modules/routes.js"),
      auth     = require("./modules/authentication.js"),
      slist    = require("./modules/speechlist.js"),
      stime    = require("./modules/speechtime.js"),
      i18n     = require("./modules/i18n.js");

//////////////// DEBUG ////////////////
for (var list in config.lists) {
  slist.new(config.lists[list]);
}
slist.switch(0);
stime.time = 15;

var pages = [
  {"name": "Redeliste", "url": "/admin/speechlist", "icon": "list"},
];
///////////////////////////////////////

require("./modules/socket-client.js")(io);
require("./modules/socket-admin.js")(io);

app.set("view engine", "twig");
app.set("twig options", {
    allow_async: true,
    strict_variables: false
});
app.set('cache', false);
twig.cache(false);

app.locals.sites = pages;
app.locals.locale = config.server.language;

app.use(flash());
app.use(express.urlencoded({
  extended: false
}));
app.use(session({
  secret: "diesisteintest",
  resave: false,
  saveUninitialized: false
}));
app.use(i18n);

app.use(passport.initialize());
app.use(passport.session())

app.use("/static", express.static('static'));
app.use("/static/jquery", express.static(__dirname + '/node_modules/jquery/dist/'));
app.use("/static/uikit", express.static(__dirname + '/node_modules/uikit/dist/'));
app.use("/static/sortablejs", express.static(__dirname + '/node_modules/sortablejs/'));
app.use("/static/sortablejs", express.static(__dirname + '/node_modules/jquery-sortablejs/'));

app.use("/", routes);

http.listen(config.server.port, () => {
  console.log(`Listening to port ${config.server.port}...`);
});
