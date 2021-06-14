const client = io("/client");
const animationspeed = "fast";
var list = [];
var timerSlideUpDelay = null;

function updateList(data) {
  if (data.length == 0) {
    list = [];
    return $("#speechlist").slideUp(animationspeed, function () {
      $(this).empty().show();
    });
  }
  for (var index = 0; index < Math.max(list.length, data.length); index++) {
    if (data[index] == list[index]) {
      continue;
    }
    if (index >= list.length) {
      var item = $(`<li>${data[index]}</li>`).hide();
      $("#speechlist").append(item);
      item.slideDown(animationspeed);
    } else if (index >= data.length) {
      $($("#speechlist").children()[index]).slideUp(animationspeed, function () {
        $(this).remove();
      });
    } else {
      $($("#speechlist").children()[index]).text(data[index]);
    }
  }
  list = data;
}

client.on("list.sort", function (data) {
  updateList(data);
});

client.on("list.edit", function (data) {
  list[data[0]] = data[1];
  $($("#speechlist").children()[data[0]]).text(data[1]);
});

client.on("list.load", function (data) {
  updateList(data.list);
  if (data.closed) {
    $("#lock").slideDown();
  } else {
    $("#lock").slideUp();
  }
  $("#title").text(data.title);
});

function timeToString(timestamp) {
  var seconds = timestamp % 60;
  var minutes = (timestamp - seconds) / 60;
  return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

client.on("timer.load", function (data) {
  clearTimeout(timerSlideUpDelay);
  if (data.time == false) {
    $("#timer").slideUp();
    return;
  }
  $("#timer").text(timeToString(data.current));
  if (data.running || data.paused) {
    $("#timer").slideDown();
  } else {
    timerSlideUpDelay = setTimeout(function () {
      $("#timer").slideUp();
    }, 3000);
  }
  $("#timer").removeClass("uk-text-muted");
});

client.on("timer.start", function () {
  $("#timer").removeClass("uk-text-muted");
  $("#timer").slideDown();
  clearTimeout(timerSlideUpDelay);
});

client.on("timer.pause", function () {
  $("#timer").addClass("uk-text-muted");
});

client.on("timer.reset", function (time) {
  $("#timer").text(timeToString(time));
  $("#timer").removeClass("uk-text-muted");
  clearTimeout(timerSlideUpDelay);
  timerSlideUpDelay = setTimeout(function () {
    $("#timer").slideUp();
  }, 3000);
});

client.on("timer.tick", function (time) {
  $("#timer").text(timeToString(time));
});

client.on("list.close", function () {
  $("#lock").slideDown();
});

client.on("list.reopen", function () {
  $("#lock").slideUp();
});

client.on("list.append", function (data) {
  list.push(data);
  var item = $(`<li>${data}</li>`).hide();
  $("#speechlist").append(item);
  item.slideDown(animationspeed);
});

client.on("list.clear", function () {
  list = [];
  return $("#speechlist").slideUp(animationspeed, function () {
    $(this).empty().show();
  });
});

client.on("list.next", function () {
  list.shift();
  $("#speechlist :first").slideUp(animationspeed, function () { $(this).remove(); });
});

client.on("list.delete", function (index) {
  list.splice(index, 1);
  $($("#speechlist").children()[index]).slideUp(animationspeed, function () { $(this).remove(); });
});

client.on("list.title_change", function (title) {
  $("#title").text(title);
});

$("body").on("DOMSubtreeModified", "#speechlist", function () {
  $("#speechlist li").removeClass("uk-text-bold");
  $("#speechlist :first").addClass("uk-text-bold");
});
