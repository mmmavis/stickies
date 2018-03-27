const ANIMATION_DELAY = 400; // in ms

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDwy5Kbmd7GHTdXbRewd8OZaArBWPKDurs",
  authDomain: "erika-stickies.firebaseapp.com",
  databaseURL: "https://erika-stickies.firebaseio.com",
  projectId: "erika-stickies",
  storageBucket: "erika-stickies.appspot.com",
  messagingSenderId: "282840178411"
};

firebase.initializeApp(config);

firebase.auth().signInAnonymously().catch(function(error) {
  console.log("error", error);
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    // var isAnonymous = user.isAnonymous;
    // var uid = user.uid;
    // console.log("user");

    renderAllStickies(function() {
      setTimeout(function() {
        $("#wall").append(createHTML({},"new-sticky-template"));
      }, ANIMATION_DELAY);
    });
  } else {
    // User is signed out.
    // console.log("out");
  }
});

Handlebars.registerHelper("localTime", function(timestamp) {
  return moment.unix(timestamp/1000).format("YYYY-MM-DD hh:mm a");
});


function renderAllStickies(done) {
  firebase.database().ref('/stickies').once('value').then(function(snapshot) {
    var stickies = snapshot.val();
    var numStickies = Object.keys(stickies).length;
    var currIndex = 0;

    function renderStickiesWithDelay() {
      var key = Object.keys(stickies)[currIndex];
      var currentSticky = stickies[key];

      currentSticky.id = key;
      renderSticky(currentSticky);

      currIndex += 1;
      if (currIndex <= numStickies-1) {
        setTimeout(renderStickiesWithDelay, ANIMATION_DELAY);
      } else {
        done();
      }
    }

    renderStickiesWithDelay();
  });
}

function createHTML(data, templateId) {
  var source = document.getElementById(templateId).innerHTML;
  var template = Handlebars.compile(source);

  return template(data);
}

function isSrcVideo(filename = "") {
  var ext = filename.split("?")[0].split(".").pop();

  switch (ext.toLowerCase()) {
    case "mp4":
    case "avi":
    case "mpg":
      return true;
    }

  return false;
}

function renderSticky(sticky) {
  // check if imgSrc is actually a video...
  if (isSrcVideo(sticky.imgSrc)) {
    sticky.imgSrcIsVideo = true;
  }

  $("#wall").append(createHTML(sticky,"sticky-template"));
}

// send new sticky
$("body").on("submit", "#new-sticky-form", function(event) {
  event.preventDefault();

  var ref = firebase.database().ref("stickies").push();
  var task = ref.set({
    timestamp: Date.now().toString(),
    message: $(this).find("[name=message]").val().replace(/\n/g,"<br>"),
    submitter: $(this).find("[name=submitter]").val(),
    imgSrc: $(this).find("[name=imgSrc]").val(),
    bgColor: $(this).find("[name=bgColor]:checked").val(),
    textColor: null
  }, function complete() {
      // reload page so new sticky shows... a cheat...
      window.location.reload(true);
      done();
    }
  );
});

$("body").on("change", "#new-sticky-form input[type=radio][name=bgColor]", function(event) {
  $.each($("input[type=radio][name=bgColor]"), function(index, option) {
    $("#new-sticky-note").removeClass(option.value);
  });

  $("#new-sticky-note").addClass(this.value);
});
