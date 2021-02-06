const express = require("express"),
      router = express.Router(),
      fs = require("fs");

router.get("/", (req, res) => {
  res.render("client/index");
});

router.get("/admin", (req, res) => {
  res.redirect("/admin/speechlist");
});

router.get("/admin/base", (req, res) => {
  res.status(404).render("admin/404");
});

router.get("/admin/*", (req, res) => {
  if (fs.existsSync("views" + req.url + ".twig")) {
    res.render(req.url.slice(1), {site: req.url});
  } else {
    res.status(404).render("admin/404");
  }
});

module.exports = router;
