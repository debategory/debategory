const express = require("express"),
      router = express.Router(),
      fs = require("fs"),
      auth = require("./authentication.js");

router.get("/", (req, res) => {
  res.render("client/index");
});

router.get("/admin", (req, res) => {
  res.redirect("/admin/speechlist");
});

router.get("/admin/base", (req, res) => {
  res.status(404).render("admin/404");
});

router.get("/admin/login", auth.notLoggedin, (req, res) => {
  res.render("admin/login", { site: req.url });
});
router.post("/admin/login", auth.login);
router.get("/admin/logout", auth.logout);

router.get("/admin/*", auth.needsPermissions("speechlist"), (req, res) => {
  fs.exists("views" + req.url + ".twig", (exists) => {
    if (exists) {
      res.render(req.url.slice(1), {site: req.url, user: req.user});
    } else {
      res.status(404).render("admin/404");
    }
  });
});

module.exports = router;
