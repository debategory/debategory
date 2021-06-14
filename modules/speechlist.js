const EventEmitter = require("eventemitter2");

const events = [
  "append",
  "next",
  "close",
  "reopen",
  "title_change",
  "clear",
  "sort",
  "edit",
  "delete",
  "options_change"
];

class Speechlist extends EventEmitter {
  constructor(title) {
    super();
    this._title = title;
    this._closed = false;
    this._list = [];
    this._options = {
      speechtime: false
    };
  }

  append(name) {
    if (this._closed) return false;
    if (name.trim().length == 0) return false;
    this._list.push(name.trim());
    this.emit("append", name.trim());
    return true;
  }

  next() {
    this._list.shift();
    this.emit("next");
    if (this._list.length == 0) {
      this.reopen();
    }
    return true;
  }

  close() {
    if (this.closed) return false;
    this._closed = true;
    this.emit("close");
    return true;
  }

  reopen() {
    if (!this.closed) return false;
    this._closed = false;
    this.emit("reopen");
    return true;
  }

  get length() {
    return this._list.length;
  }

  get closed() {
    return this._closed;
  }

  set title(title) {
    this._title = title;
    this.emit("title_change", title);
    return true;
  }

  get title() {
    return this._title;
  }

  get names() {
    return this._list;
  }

  get object() {
    return {
      "title": this.title,
      "list": this._list,
      "closed": this._closed,
      "options": this._options
    };
  }

  get options() {
    return this._options;
  }

  set options(options) {
    this._options = options;
    this.emit("options_change", options);
    return true;
  }

  clear() {
    this._list = [];
    this.emit("clear");
    this.reopen();
    return true;
  }

  sort(oldIndex, newIndex) {
    var newlist = [];
    for (var r = 0; r < this._list.length; r++) {
      if (r < Math.min(oldIndex, newIndex) || r > Math.max(oldIndex, newIndex)) {
        newlist.push(this._list[r]);
      } else if (r == newIndex) {
        newlist.push(this._list[oldIndex]);
      } else {
        if (oldIndex < newIndex) {
          newlist.push(this._list[r + 1]);
        } else {
          newlist.push(this._list[r - 1]);
        }
      }
    }
    this._list = newlist;
    this.emit("sort", newlist);
  }

  edit(index, name) {
    if (name.trim().length == 0) return false;
    this._list[index] = name.trim();
    this.emit("edit", [index, name.trim()]);
    return true;
  }

  delete(index) {
    this._list.splice(index, 1);
    this.emit("delete", index);
    if (this._list.length == 0) {
      this.reopen();
    }
    return true;
  }
}

class Speechtimer extends EventEmitter {
  static _tick(object, dt) {
    object._current -= (dt / 1000);
    object.emit("tick", object._current);
    if (object._current <= 0) {
      object._current = 0;
      object.pause();
    }
    return true;
  }

  constructor(time) {
    super();
    this._time = time;
    this._current = time;
    this._running = false;
    this._interval = null;
  }

  reset() {
    this._running = false;
    this._current = this._time;
    clearInterval(this._interval);
    this.emit("reset", this._time);
    return true;
  }

  start() {
    if (this._running || this._current <= 0 || this._time == null) return false;
    this._running = true;
    this._interval = setInterval(Speechtimer._tick, 1000, this, 1000);
    this.emit("start");
    return true;
  }

  pause() {
    if (!this._running) return false;
    this._running = false;
    clearInterval(this._interval);
    this.emit("pause");
    return true;
  }

  set time(time) {
    this._time = time;
    if (this._current == null) {
      this._current = time;
    }
    this.emit("set_time", time);
    if (!this._running) {
      this.reset();
    }
    return true;
  }

  get time() {
    return this._time;
  }

  get current() {
    return this._current;
  }

  get running() {
    return this._running;
  }

  get paused() {
    return (!this._running && this._time != this._current);
  }

  get stopped() {
    return !this.running;
  }

  get object() {
    return {
      "running": this.running,
      "paused": this.paused,
      "stopped": this.stopped,
      "time": this.time,
      "current": this.current
    };
  }
}

class SpeechlistSwitch extends EventEmitter {
  constructor() {
    super();
    this.id = false;
    this.timer = new Speechtimer(false);
    this._lists = [];
    this._currentListeners = [];
    this._internalListeners = [];
  }

  _eventhandler(this, event, data, list) {
    console.log(event, data, sls, this);
  }

  new(title) {
    var id = this._lists.push(new Speechlist(title)) - 1;
    (function (obj) {
      obj._internalListeners.push(obj._lists[id].onAny((event, data) => {
        obj._eventhandler(obj, event, data, this);
      }), {objectify: true})
    })(this);
    this.emit("manager.new", id);
    return (id);
  }

  switch(id) {
    if (id >= this._lists.length) {
      return false;
    }
    if (this.id !== false) {
      for (var i in this._currentListeners) {
        this._currentListeners[i].off();
      }
    }
    for (var i in events) {
      (function (obj, evt) {
        obj._currentListeners.push(obj._lists[id].on(evt, (data) => {
          obj.emit("list." + evt, data);
        }, {objectify: true}));
      })(this, events[i]);
    }
    this._currentListeners.push(this._lists[id].on("options_change", (data) => {
      this.timer.time = this._lists[id].options.speechtime;
    }, {objectify: true}));
    this.id = id;
    this.timer.time = this._lists[id].options.speechtime;
    this.timer.reset();
    if (this._lists[id].length > 0) {
      this.timer.start();
    }
    this.emit("manager.switch", id);
    return true;
  }

  get(id) {
    if (id >= this._lists.length) {
      return false;
    }
    return this._lists[id];
  }

  remove(id) {
    if (id >= this._lists.length) {
      return false;
    }
    if (id == this.id) {
      this.id = false;
      this._currentListener.offAny();
    } else if (id < this.id) {
      this.id--;
    }
    this._internalListeners[id].off();
    delete this._lists[id];
    delete this._internalListeners[id];
    this._lists.splice(id, 1);
    this.emit("manager.remove", id);
    return true;
  }

  get current() {
    return this.get(this.id);
  }

  get length() {
    return this._lists.length;
  }
}

module.exports = new SpeechlistSwitch();
