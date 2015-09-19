/** Helper Functions **/
function shuffleArray(array) {
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}


Meteor.startup(function () {
  process.env.MAIL_URL = "smtp://outgoing.mit.edu:25/"

  // DONT DO IT!
  if (false) {
    console.log("sending email");
    Email.send({
      "from": "assassins-master@mit.edu",
      "to": [
        "miles@milessteele.com"
      ],
      "subject": "now it sends emails",
      "text": "exciting",
      "html": '<h1 style="color: blue; background: red">MORE EXCITING</h1><br><span style="font-size:6pt">I apologize for that.</style>'
    });
    console.log("email sent");
  }
});

Meteor.methods({
  initializeGame: function(gameId) {
    var game = Games.findOne({"id": gameId});
    if (!game) {
      return {"status": "failed", "error": "No such game."}
    }

    var players = Players.find({"gameId": gameId}).fetch();
    players = shuffleArray(players);
    for (var i = 0; i < players.length; i++) {
      var p1 = players[i];
      var p2 = players[(i + 1) % players.length];
      p1.currentVictim = p2.id;
      p1.alive = true;
      p1.victimList = [];
      Email.send({
      "from": "assassins-master@mit.edu",
      "to": [
        p1.email
      ],
      "subject": "now it sends",
      "text": p1.currentVictim,
      "html": '<h1 style="color: blue; background: red">MORE EXCITING</h1><br><span style="font-size:6pt">I apologize for that.</style>'
    });

    }
  }
});

