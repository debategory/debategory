const bcrypt = require("bcrypt"),
      fs = require("fs"),
      users = require("../data/users.json"),
      express = require("express"),
      passport = require("passport"),
      passlocal = require("passport-local").Strategy;

class User {
  constructor(entry) {
    this._username = entry.username;
    this._name = entry.name;
    this._password = entry.password;
    this._permissions = entry.permissions;
  }

  get username() {
    return this._username;
  }

  get name() {
    return this._name;
  }

  hasPermission(permission) {
    return this._permissions.includes(permission);
  }

  authenticate(password) {
    return password == this._password;
    // bcrypt.compare(password, this._password);
  }
}

class UserManager {
  constructor() {
    this._users = [];
    this.readDatabase();
    passport.use(new passlocal(this.authenticate));
    passport.serializeUser(this.serialize);
    passport.deserializeUser(this.deserialize);
  }

  readDatabase() {
    for (var i in users) {
      var user = users[i];
      this._users.push(new User(user));
    }
  }

  writeDatabase() {}

  getUser(username) {
    return this._users.find(element => element.username == username);
  }

  static getUser(username) {
    return um._users.find(element => element.username == username);
  }

  authenticate(username, password, done) {
    var user = UserManager.getUser(username);
    if (!user) {
      return done(null, false);
    }
    if (!user.authenticate(password)) {
      return done(null, false);
    }
    return done(null, user);
  }

  serialize(user, done) {
    return done(null, user.username);
  }

  deserialize(username, done) {
    return done(null, UserManager.getUser(username));
  }

  notLoggedin(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect("./");
  }

  needsAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect("./login");
  }

  needsPermissions(permissions) {
    return (req, res, next) => {
      if (!req.isAuthenticated()) {
        return res.redirect("./login");
      }
      for (var i in arguments) {
        if (!req.user.hasPermission(arguments[i])) {
          return res.render("admin/401");
        }
      }
      return next();
    };
  }

  login(req, res, next) {
    return passport.authenticate('local', {
      successRedirect: './speechlist',
      failureRedirect: './login',
      failureFlash: "login_fail"
    })(req, res, next);
  }

  logout(req, res) {
    if (req.isAuthenticated()) {
      req.logout();
      req.flash("success", "logout_success");
      return res.redirect("./login");
    }
    return res.redirect("./login");
  }
}

um = new UserManager();

module.exports = um;
