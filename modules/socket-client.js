const slist = require("./speechlist.js"),
      stime = require("./speechtime.js");

module.exports = (io) => {
  const client = io.of("/client");

  client.on("connect", (socket) => {
    socket.emit("list.load", slist.current.object);
    socket.emit("timer.load", stime.object);
  });

  slist.on("manager.switch", (id) => {
    client.emit("list.load", slist.current.object);
    client.emit("timer.load", stime.object);
  });

  slist.onAny((event, data) => {
    client.emit(event, data);
  });

  stime.onAny((event, data) => {
    client.emit("timer." + event, data);
  });
};
