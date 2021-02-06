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
    this._options = null;
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
      "closed": this._closed
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

class SpeechlistSwitch extends EventEmitter {
  constructor() {
    super();
    this.id = false;
    this._lists = [];
    this._currentListeners = [];
  }

  new(title) {
    this._lists.push(new Speechlist(title));
    this.emit("manager.new", this._lists.length - 1);
    return (this._lists.length - 1);
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
    this.id = id;
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
    delete this._lists[id];
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
