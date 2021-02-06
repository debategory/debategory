const EventEmitter = require("eventemitter2");

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

module.exports = new Speechtimer(null);
