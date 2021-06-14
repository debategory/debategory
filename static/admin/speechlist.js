const admin = io("/admin");
const animationspeed = "fast";
var lists = [];
var connected;

////////////////////////////////////
///////// HELPER FUNCTIONS /////////
////////////////////////////////////

function getListIndex(element) {
  var speechlists = $(element).parents("#speechlists").children();
  var container = $(element).parents(".speechlist-container")[0];
  return speechlists.index(container);
}

function editItem(element) {
  var input = $(`<input type="text" class="uk-input uk-form-blank uk-form-small" />`);
  var text = $(element).text().trimRight();
  var id = $(element).parent().index();
  tt = element;
  $($(element).parent()).children("ul").hide();
  $(element).html(input);
  $(input).focus();
  $(input).val(text);
  function resetForm(em) {
    $($(em).parent()).parent().children("ul").show();
    $(em).parent().html(text);
  }
  $(input).keydown(function (e) {
    if (e.keyCode == 27) return resetForm(this);
    if (e.keyCode == 13) {
      if ($(this).val().trim().length > 0) admin.emit("edit", getListIndex(element), id, $(this).val().trim());
      resetForm(this);
    }
  });
  $(input).focusout(function (e) {
    resetForm(this);
  });
}

function append(list, data) {
  var item = $(`<li><span>${data}</span></li>`).hide();
  // var item = $(`<li class="uk-visible-toggle"><span>${data}</span>
  //   <ul class="uk-invisible-hover uk-align-right uk-flex-inline uk-iconnav">
  //     <li><a href="#" class="speechlist-item-prioritise" uk-icon="icon: bolt"></a></li>
  //     <li><a href="#" class="speechlist-item-edit" uk-icon="icon: pencil"></a></li>
  //     <li><a href="#" class="speechlist-item-delete" uk-icon="icon: trash"></a></li>
  //     <li><span class="uk-drag speechlist-item-sort" uk-icon="icon: menu"></span></li>
  //   </ul>
  // </li>`).hide();
  if ($($(".speechlist")[list]).is(":hidden")) {
    $($(".speechlist-empty")[list]).hide();
    $($(".speechlist-container")[list]).find(".speechlist-next").prop("disabled", false);
    $($(".speechlist")[list]).fadeIn(animationspeed);
  }
  $($(".speechlist")[list]).append(item);
  $(item).slideDown(animationspeed);
}

function timeToString(timestamp) {
  var seconds = timestamp % 60;
  var minutes = (timestamp - seconds) / 60;
  return minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
}

function checkEmpty(list) {
  if ($($(".speechlist")[list]).children().length == 0) {
    $($(".speechlist")[list]).hide();
    $($(".speechlist-empty")[list]).fadeIn(animationspeed);
    $($(".speechlist-container")[list]).find(".speechlist-next").prop("disabled", true);
  } else {
    $($(".speechlist")[list]).fadeIn(animationspeed);
    $($(".speechlist-empty")[list]).hide();
    $($(".speechlist-container")[list]).find(".speechlist-next").prop("disabled", false);
  }
  speechtimeDisable();
}

function speechtimeDisable() {
  $(".speechlist-container").each(function () {
    if (!$(this).find(".speechlist-shown").is(":visible")) return;
    $("#speechtimerStart").prop("disabled", $(this).find(".speechlist-empty").is(":visible"));
  });
}

function showSettings(list) {
  $("#settingsTitle").val(lists[list].title);
  UIkit.modal($("#settings")).show();
}

////////////////////////////////////
////////// SOCKET EVENTS ///////////
////////////////////////////////////

admin.on("disconnect", function(a, b) {
  connected = false;
  $("#saying").text("Verbindung zum Server verloren...");
  $("#loader").fadeIn("slow");
});

admin.on("connect", function(a, b) {
  if (connected == false) {
    connected = true;
    $("#loader").fadeOut("slow");
  }
});

admin.on("loadList", function(list, object) {
  if (object.closed) {
    $($(".speechlist-container")[list]).find(".speechlist-close").hide();
    $($(".speechlist-container")[list]).find(".speechlist-reopen").show();
    $($(".speechlist-input")[list]).prop("disabled", true).val("Liste geschlossen.");
  } else {
      $($(".speechlist-container")[list]).find(".speechlist-reopen").hide();
      $($(".speechlist-container")[list]).find(".speechlist-close").show();
      $($(".speechlist-input")[list]).prop("disabled", false).val("");
  }
  for (var i in object.list) {
    append(list, object.list[i]);
  }
  checkEmpty(list);
  lists[list] = object;
});

admin.on("current.title_change", function (title) {
  $("#speechlistTitle").text(title);
});

admin.on("current.switch", function (list) {
  $(".speechlist-show").show();
  $(".speechlist-shown").hide();
  $($(".speechlist-container")[list]).find(".speechlist-show").hide();
  $($(".speechlist-container")[list]).find(".speechlist-shown").show();
});

admin.on("append", function(list, data) {
  append(list, data);
});

admin.on("close", function(list) {
  $($(".speechlist-container")[list]).find(".speechlist-close").hide();
  $($(".speechlist-container")[list]).find(".speechlist-reopen").show();
  $($(".speechlist-input")[list]).prop("disabled", true).val("Liste geschlossen.");
});

admin.on("reopen", function(list) {
  $($(".speechlist-container")[list]).find(".speechlist-reopen").hide();
  $($(".speechlist-container")[list]).find(".speechlist-close").show();
  $($(".speechlist-input")[list]).prop("disabled", false).val("");
});

admin.on("clear", function (list) {
  $($(".speechlist-container")[list]).find(".speechlist-reopen").hide();
  $($(".speechlist-container")[list]).find(".speechlist-close").show();
  $($(".speechlist-input")[list]).prop("disabled", false).val("");
  $($(".speechlist")[list]).slideUp(animationspeed, function () {
    $(this).html("");
    checkEmpty(list);
  });
});

admin.on("delete", function (list, index) {
  $($($(".speechlist")[list]).children()[index]).slideUp(animationspeed, function() {
    $(this).remove();
    checkEmpty(list);
  });
});

admin.on("next", function (list) {
  $($(".speechlist")[list]).children(":first").slideUp(animationspeed, function() {
    $(this).remove();
    checkEmpty(list);
  });
});

admin.on("edit", function (list, data) {
  $($($(".speechlist")[list]).children()[data[0]]).children("span").text(data[1]);
});

admin.on("timer.load", function (timer) {
  $("#speechtimerTime").text(timeToString(timer["current"])).removeClass("uk-text-warning").removeClass("uk-text-danger");
  $("#speechtimerBar").attr("max", timer["time"]).val(timer["current"]).removeClass("dg-progress-warning");
  if (timer["running"]) {
    $("#speechtimerStart").hide();
    $("#speechtimerPause").show();
  } else {
    $("#speechtimerStart").show();
    $("#speechtimerPause").hide();
  }
  speechtimeDisable();
  if (timer["current"] == 0) {
    $("#speechtimerStart").prop("disabled", true);
    $("#speechtimerTime").addClass("uk-text-danger");
  } else if (timer["current"] < 10) {
    $("#speechtimerBar").addClass("dg-progress-warning");
    $("#speechtimerTime").addClass("uk-text-warning");
  }
  $("#speechtimerReset").prop("disabled", (timer["running"] || timer["current"] == timer["time"]));
  finishSayings();
});

admin.on("timer.tick", function (time) {
  $("#speechtimerTime").text(timeToString(time));
  $("#speechtimerBar").val(time);
  if (time == 0) {
    $("#speechtimerTime").removeClass("uk-text-warning").addClass("uk-text-danger");
  } else if (time < 10) {
    $("#speechtimerBar").addClass("dg-progress-warning");
    $("#speechtimerTime").addClass("uk-text-warning");
  }
});

admin.on("timer.start", function () {
  $("#speechtimerStart").hide();
  $("#speechtimerPause").show();
  $("#speechtimerReset").prop("disabled", true);
});

admin.on("timer.pause", function () {
  $("#speechtimerStart").show().prop("disabled", $("#speechtimerBar").val() == 0);
  $("#speechtimerPause").hide();
  $("#speechtimerReset").prop("disabled", false);
});

admin.on("timer.reset", function (time) {
  $("#speechtimerTime").text(timeToString(time)).removeClass("uk-text-warning").removeClass("uk-text-danger");
  $("#speechtimerBar").attr("max", time).val(time).removeClass("dg-progress-warning");
  $("#speechtimerStart").show();
  $("#speechtimerPause").hide();
  $("#speechtimerReset").prop("disabled", true);
  speechtimeDisable();
});

////////////////////////////////////
////////// USER ACTIONS ////////////
////////////////////////////////////

$(".speechlist-input").keydown(function (e) {
  if(e.keyCode == 13) {
    if ($(this).val().trim().length == 0) return false;
    admin.emit("append", getListIndex(this), $(this).val().trim());
    $(this).val("");
  }
});

$(".speechlist").on("dblclick", "span", function () {
  editItem(this);
});

$(".speechlist-next").click(function () {
  admin.emit("next", getListIndex(this));
});

$(".speechlist-close").click(function () {
  admin.emit("close", getListIndex(this));
});

$(".speechlist-reopen").click(function () {
  admin.emit("reopen", getListIndex(this));
});

$(".speechlist-clear").click(function () {
  admin.emit("clear", getListIndex(this));
});

$(".speechlist-settings").click(function() {
  showSettings(getListIndex(this));
});

$(".speechlist-show").click(function () {
  admin.emit("switch", getListIndex(this));
});

$("#speechtimerStart").click(function () {
  admin.emit("timer_start");
});

$("#speechtimerPause").click(function () {
  admin.emit("timer_pause");
});

$("#speechtimerReset").click(function () {
  admin.emit("timer_reset");
});

$("body").on("click", ".speechlist-item-edit", function() {
  editItem($(this).parents(".uk-visible-toggle").children()[0]);
  return false;
});

$("body").on("click", ".speechlist-item-delete", function() {
  var id = $(this).parents(".uk-visible-toggle").index();
  admin.emit("delete", getListIndex(this), id);
  return false;
});

// $("body").on("moved", ".uk-sortable", function(e) {
//   // var id = $(this).parents(".uk-visible-toggle").index();
//   // admin.emit("delete", getListIndex(this), id);
//   console.log(e.originalEvent.);
//   console.log(this);
//   return false;
// });

UIkit.util.on('.speechlist', 'moved', function (a, b, c) {
  console.log(a);
  console.log(b);
  console.log(c);
});

$("body").on("mouseover", ".speechlist li", function() {
  $(this).append(`<ul class="uk-align-right uk-flex-inline uk-iconnav">
    <li><a href="#" class="speechlist-item-prioritise" uk-icon="icon: bolt"></a></li>
    <li><a href="#" class="speechlist-item-edit" uk-icon="icon: pencil"></a></li>
    <li><a href="#" class="speechlist-item-delete" uk-icon="icon: trash"></a></li>
    <li><span class="uk-drag speechlist-item-sort" uk-icon="icon: menu"></span></li>
  </ul>`).mouseout(function () {
    $(this).find("ul").remove();
  });
});

$("body").on("DOMSubtreeModified", ".speechlist", function() {
  $(this).children().removeClass("uk-text-bolder");
  $($(this).children()[0]).addClass("uk-text-bolder");
});

$("#settingsSpeechtimeEnable").change(function() {
  if ($(this).prop("checked")) {
    $("#settingsSpeechtimeInput").slideDown(animationspeed);
  } else {
    $("#settingsSpeechtimeInput").slideUp(animationspeed);
  }
});
