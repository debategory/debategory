const slist = require("./speechlist.js");

module.exports = (io) => {
  const admin = io.of("/admin");

  admin.on("connect", (socket) => {
    for (var i = 0; i < slist.length; i++) {
      socket.emit("load_list", i, slist.get(i).object)
    }
    socket.emit("current.title_change", slist.current.title);
    socket.emit("current.switch", slist.id);
    socket.emit("timer.load", slist.timer.object);

    socket.on("append", (list, name) => {
      slist.get(list).append(name);
    });

    socket.on("next", (list) => {
      slist.get(list).next();
    });

    socket.on("edit", (list, index, name) => {
      slist.get(list).edit(index, name);
    });

    socket.on("delete", (list, index) => {
      slist.get(list).delete(index);
    });

    socket.on("sort", (list, oldIndex, newIndex) => {
      slist.get(list).sort(oldIndex, newIndex);
    });

    socket.on("title_change", (list, title) => {
      slist.get(list).title = title;
      admin.emit("title_change", list, title);
    });

    socket.on("clear", (list) => {
      slist.get(list).clear();
    });

    socket.on("close", (list) => {
      slist.get(list).close();
    });

    socket.on("reopen", (list) => {
      slist.get(list).reopen();
    });

    socket.on("options_change", (list, options) => {
      slist.get(list).options = options;
      admin.emit("options_change", list, options);
    });

    socket.on("switch", (list) => {
      slist.switch(list);
    });

    socket.on("timer_start", () => {
      slist.timer.start();
    });

    socket.on("timer_pause", () => {
      slist.timer.pause();
    });

    socket.on("timer_reset", () => {
      slist.timer.reset();
    });
  });

  slist.on("list.title_change", (title) => {
    admin.emit("current.title_change", title);
  });

  slist.on("list.options_change", (title) => {
    admin.emit("current.options_change", title);
  });

  slist.on("manager.switch", (list) => {
    admin.emit("current.switch", list);
    admin.emit("current.title_change", slist.current.title);
    admin.emit("timer.load", slist.timer.object);
  });

  slist.timer.on("set_time", (data) => {
    admin.emit("timer.load", slist.timer.object);
  })

  slist.timer.onAny((event, data) => {
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
