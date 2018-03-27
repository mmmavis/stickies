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
        setTimeout(renderStickiesWithDelay, 400);
      } else {
        done();
      }
    }

    renderStickiesWithDelay();
  });
}

function createStickyHTML(sticky) {
  var source = document.getElementById("sticky-template").innerHTML;
  var template = Handlebars.compile(source);

  return template(sticky);
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

  $("#wall").append(createStickyHTML(sticky));
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

$("#new-sticky-form").hide();

$("#pencil-toggle").on("click", function(event) {
  $("body").toggleClass("show-form");
  $("#new-sticky-form")[0].reset();
  $("#new-sticky-form").show();
  $(this).hide();
});
