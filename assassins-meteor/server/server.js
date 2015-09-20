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
    console.log("Shuffled players:" , players);

    for (var i = 0; i < players.length; i++) {
      var p1 = players[i];
      var p2 = players[(i + 1) % players.length];
      Players.update({_id: p1._id}, {$set: {
          currentVictim: p2._id,
          alive: true,
          victimList: []
      }});
      user1 = Meteor.users.findOne({_id: p1.userId});
      user2 = Meteor.users.findOne({_id: p2.userId});
      console.log(user1.emails[0].address);
      Meteor.assassinsEmails.gameStarted(user1,gameId,user2);
    }
    Games.update( {
      id: gameId
    }, {
      $set: { started: true, finished:false}
    });
    return {"status": "ok"};
  },
  cancelGame: function(gameId) {
    console.log(gameId);
    var game = Games.findOne({"id": gameId});
    Games.update( {
      id: gameId
    }, {
        $set: {finished: true}
    });
    console.log(game);
    if (game.started){
      //TODO send Email saying that running game has been canceled
      console.log("running game canceled");
    } else {
      //TODO send Email saying the game has been canceled before it started
      console.log("game never began");
    }
    return "something";
  },
  createGame: function(mailingList, gameId) {
    Meteor.assassinsEmails.invitation(mailingList,gameId);
    console.log("sent email to", mailingList);
    return "something";
  },
  newTarget: function(killerPlayer) {
    var newTargetPlayer = Players.findOne({_id: killerPlayer.currentVictim});
    Meteor.assassinsEmails.nextTarget(
        Meteor.users.findOne({_id: killerPlayer.userId}),
        Meteor.users.findOne({_id: newTargetPlayer.userId})
    );
    return "something";
  }
});

