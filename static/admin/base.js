const sayings = [
  "<b>Debategory</b> ist übrigens Open-Source!",
  "Du kannst <b>Namen</b> in der Redeliste auch <b>bearbeiten</b>, indem du doppelt auf sie klickst.",
  "Hast du den <b>Dark Mode</b> schon ausprobiert? Klicke dafür einfach auf das <span uk-icon=\"icon: paint-bucket\" class=\"uk-text-top\"></span>-Symbol.",
  "Danke, dass du <b>Debategory</b> benutzt!",
  "Wenn du Feedback zu <b>Debategory</b> hast, schreib uns einfach an <a href=\"mailto:support@debategory.eu\">support@debategory.eu</a>."
];
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
  $(".uk-card-default").toggleClass("uk-card-secondary");
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
  return false;
}

function shuffleSayings(used = []) {
  var cSayings = [];
  if (used.length == sayings.length) {
    $("#saying").fadeOut("slow", function () {
      $($(this).parent().children()[0]).fadeOut(function () {
        $(this).parent().prepend("<span uk-icon=\"icon: close; ratio: 4\"></span>").hide().fadeIn();
        $("#saying").html("Das dauert aber ganz schön lange... Bitte lade die Seite neu.").fadeIn("slow");
        $(this).remove();
      });
    });
    return;
  }
  for (var i in sayings) {
    if (used.indexOf(i) != -1) continue;
    cSayings.push(i);
  }
  var index = Math.floor(Math.random() * cSayings.length);
  $("#saying").fadeOut("slow", function () {
    $(this).html(sayings[cSayings[index]]).fadeIn("slow");
  });
  if (finished) {
    $("#loader").fadeOut("slow");
    return;
  }
  used.push(cSayings[index]);
  setTimeout(shuffleSayings, 3000, used);
}

function finishSayings() {
  finished = true;
}

function setTime() {
  var date = new Date;
  $("#clockTime").text(date.toLocaleTimeString());
  $("#clockDate").text(date.getDate() + "." + (date.getMonth() + 1).toString().padStart(2, "0") + ".");
}

$("#toggleFullscreen").click(function () {
  toggleFullscreen()
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
              @@@@@@@@@@@@@      open speechlist
              @@@@@@@@@@@        software
              @@@@@@@@@
              @@@@@@@.      https://debategory.eu
              @@@@@@
              @@@@          Feedback?  Mail us at
              @@            support@debategory.eu
  `);
});

if (window.sessionStorage.getItem("darkmode") == "true") {
  toggleDarkmode();
}
