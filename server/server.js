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


  if (Meteor.settings.public.fake_db_mode &&
      Meteor.users.find().count() === 0) {
    console.log("Filling database with dummy data.");
    fillDummyDb();
  }
});

Meteor.methods({
  initializeGame: function(gameId) {
    var game = Games.findOne({"_id": gameId});
    console.log(game);
    if (!game) {
      console.log("Not a game!")
      return {"status": "failed", "error": "No such game."};
    }
    console.log("41");
    var characters = Characters.find({"gameId": gameId}).fetch();
    characters = shuffleArray(characters);
    console.log("Shuffled characters:" , characters);

    for (var i = 0; i < characters.length; i++) {
      var p1 = characters[i];
      var p2 = characters[(i + 1) % characters.length];
      Characters.update({_id: p1._id}, {$set: {
          currentVictim: p2._id,
          alive: true,
          victimList: []
      }});
      user1 = Meteor.users.findOne({_id: p1.userId});
      user2 = Meteor.users.findOne({_id: p2.userId});
      Meteor.assassinsEmails.gameStarted(user1, game.name, user2);
    }
    Games.update( {
      _id: gameId
    }, {
      $set: { started: true, finished:false}
    });
    return {"status": "ok"};
  },
  cancelGame: function(gameId) {
    console.log("Server.js: canceling game...")
    console.log(gameId);
    var game = Games.findOne({"_id": gameId});
    Games.update( {
      _id: gameId
    }, {
        $set: {finished: true}
    });
    console.log(game);
    Meteor.assassinsEmails.cancelled(game.mailingList, game.name)
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
    var game = Games.findOne({_id: gameId});
    Meteor.assassinsEmails.invitation(mailingList, game.name);
    return "something";
  },
  newTarget: function(killerCharacter) {
    var newTargetCharacter = Characters.findOne({_id: killerCharacter.currentVictim});
    Meteor.assassinsEmails.nextTarget(
      Meteor.users.findOne({_id: killerCharacter.userId}),
      Meteor.users.findOne({_id: newTargetCharacter.userId})
    );
    return "something";
  }
});

