const slist = require("./speechlist.js");

module.exports = (io) => {
  const client = io.of("/client");

  client.on("connect", (socket) => {
    socket.emit("list.load", slist.current.object);
    socket.emit("timer.load", slist.timer.object);
  });

  slist.on("manager.switch", (id) => {
    client.emit("list.load", slist.current.object);
    client.emit("timer.load", slist.timer.object);
  });

  slist.onAny((event, data) => {
    client.emit(event, data);
  });

  slist.timer.on("set_time", (data) => {
    client.emit("timer.load", slist.timer.object);
  })

  slist.timer.onAny((event, data) => {
    client.emit("timer." + event, data);
  });
};
