var finished = false;
var isFullscreen = false;
var darkmodeStyle = null;

function toggleDarkmode() {
  if (darkmodeStyle) {
    $(darkmodeStyle).remove();
    darkmodeStyle = null;
  } else {
    darkmodeStyle = $('<link>').appendTo('head').attr({
      rel: 'stylesheet',
      href: '/static/admin/dark-mode.css'
    });
  }
  window.sessionStorage.setItem("darkmode", darkmodeStyle != null);
  $(".uk-card-default:not(.dg-bubble)").toggleClass("uk-card-secondary");
  $(".uk-modal-dialog").toggleClass("uk-background-secondary uk-light");
  $("#loader").toggleClass("uk-overlay-primary")
}

function toggleFullscreen() {
  if (isFullscreen) {
    $("#toggleFullscreen span").attr("uk-icon", "expand");
    if(document.exitFullscreen) {
      document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } else {
    // $("body div").first().slideUp();
    $("#toggleFullscreen span").attr("uk-icon", "shrink");
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    }
  }
  isFullscreen = !isFullscreen;
}

function shuffleSayings(oldindex = -1) {
  $("#saying").fadeOut("slow", function () {
    $("#saying span").hide();
    if (finished) {
      $("#loader").fadeOut("slow");
      return;
    }
    if (oldindex != -1) {
      $($("#sayings").children()[oldindex]).remove();
    }
    var length = $("#sayings").children().length;
    if (length == 0) {
      $("#sayingSpinner").fadeOut(function () {
        $(this).remove();
        $("#saying").parent().prepend("<span uk-icon=\"icon: close; ratio: 4\"></span>").hide().fadeIn();
        $("#sayingBadConnection").fadeIn();
      });
      return;
    }
    var index = Math.floor(Math.random() * length);
    $($("#sayings").children()[index]).show();
    $("#sayings").show();
    setTimeout(shuffleSayings, 3000, index);
  }).fadeIn("slow");
}

function finishSayings() {
  finished = true;
}

function setTime() {
  var date = new Date;
  $("#clockTime").text(date.toLocaleTimeString());
  $("#clockDate").text((date.getDate()).toString().padStart(2, "0") + "." + (date.getMonth() + 1).toString().padStart(2, "0") + ".");
}

$("#toggleFullscreen").click(function () {
  toggleFullscreen();
  return false;
});

$("#toggleDarkmode").click(function () {
  toggleDarkmode();
  return false;
});

$(function() {
  setTimeout(shuffleSayings, 500);
  setInterval(setTime, 500);
  setTime();
  console.log(`
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@                .@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@  %@@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@& /@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@
@@@@@@@@@@@@@@  @@@@@@@@@@@@@@&  @@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@               .@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
              @@@@@@@@@@@@@@@@
              @@@@@@@@@@@@@@/    Debategory – the
              @@@@@@@@@@@@@      open speech list
              @@@@@@@@@@@        software
              @@@@@@@@@
              @@@@@@@.     https://debategory.org
              @@@@@@
              @@@@         Feedback?   Mail us at
              @@           support@debategory.org
  `);
});

if (window.sessionStorage.getItem("darkmode") == "true") {
  toggleDarkmode();
}
