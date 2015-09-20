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
});

Meteor.methods({
  initializeGame: function(gameId) {
    var game = Games.findOne({"id": gameId});
    console.log(game);
    if (!game) {
      console.log("Not a game!")
      return {"status": "failed", "error": "No such game."};
    }
    console.log("41");
    var players = Players.find({"gameId": gameId}).fetch();
    players = shuffleArray(players);
    console.log("44");
    Games.update( {
      id: gameId
    }, {
      $set: { started: true }
    });
    for (var i = 0; i < players.length; i++) {
      var p1 = players[i];
      var p2 = players[(i + 1) % players.length];
      p1.currentVictim = p2.userId;
      p1.alive = true;
      p1.victimList = [];
      user1 = Meteor.users.findOne({_id: p1.userId});
      user2 = Meteor.users.findOne({_id: p2.userId});
      console.log(user1.emails[0].address); 
      Meteor.assassinsEmails.nextTarget(user1.emails[0].address,user2.emails[0].address);
    }
    console.log("66");
    return {"status": "ok"};
  },
  cancelGame: function(gameId) {
    var game = Games.findOne({"id": gameId});
    Games.update( {
      id: gameId  
    }, {
        $set: {finished: true} 
    });
    if (game.started){
      //TODO send Email saying that running game has been canceled
      console.log("running game canceled");
    } else {
      //TODO send Email saying the game has been canceled before it started
      console.log("game never began");
    }
    return "something";

  }
});

