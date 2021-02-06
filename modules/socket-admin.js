const slist = require("./speechlist.js"),
      stime = require("./speechtime.js");

module.exports = (io) => {
  const admin = io.of("/admin");

  admin.on("connect", (socket) => {
    for (var i = 0; i < slist.length; i++) {
      socket.emit("loadList", i, slist.get(i).object)
    }
    socket.emit("current.title_change", slist.current.title);
    socket.emit("current.switch", slist.id);
    socket.emit("timer.load", stime.object);

    socket.on("append", (list, name) => {
      if (list == slist.id && slist.get(list).length == 0) {
        stime.start();
      }
      slist.get(list).append(name);
    });

    socket.on("next", (list) => {
      slist.get(list).next();
      stime.reset();
      if (list == slist.id && slist.get(list).length > 0) {
        stime.start();
      }
    });

    socket.on("edit", (list, index, name) => {
      slist.get(list).edit(index, name);
    });

    socket.on("delete", (list, index) => {
      slist.get(list).delete(index);
      if (list == slist.id && index == 0) {
        stime.reset();
      }
    });

    socket.on("sort", (list, oldIndex, newIndex) => {
      slist.get(list).sort(oldIndex, newIndex);
    });

    socket.on("title_change", (list, title) => {
      slist.get(list).title = title;
    });

    socket.on("clear", (list) => {
      stime.reset();
      slist.get(list).clear();
    });

    socket.on("close", (list) => {
      slist.get(list).close();
    });

    socket.on("reopen", (list) => {
      slist.get(list).reopen();
    });

    socket.on("switch", (list) => {
      slist.switch(list);
      stime.reset();
      if (slist.get(list).length > 0) {
        stime.start();
      }
    });

    socket.on("timer_start", () => {
      stime.start();
    });

    socket.on("timer_pause", () => {
      stime.pause();
    });

    socket.on("timer_reset", () => {
      stime.reset();
    });
  });

  slist.on("list.title_change", (title) => {
    admin.emit("current.title_change", title);
  });

  slist.on("manager.switch", (list) => {
    admin.emit("current.switch", list);
    admin.emit("current.title_change", slist.current.title);
  });

  stime.onAny((event, data) => {
    admin.emit("timer." + event, data);
  });

  for (var i = 0; i < slist.length; i++) {
    (function(id) {
      slist.get(id).onAny((event, data) => {
        admin.emit(event, id, data);
      });
    })(i);
  }
};
