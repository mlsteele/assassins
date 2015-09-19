/**** Routes ****/
Router.configure({
    layoutTemplate: 'main'
});
Router.route('/', {
    template: 'home'
});
Router.route('/create', {
    template: 'create'
});
Router.route('/join', {
    template: 'join'
});
Router.route('/dashboard', {
    template: 'dashboard'
});
Router.route('/pregame', {
    template: 'pregame'
});
Router.route('/start', {
    template: 'start'
});
Router.route('/init', {
    template: 'init'
});
/**** Helper Functions ****/
function currentGameId() {
    if (!Meteor.user()) return undefined;
    var profile = Meteor.user().profile;
    if (!profile) return undefined;
    if (!profile.currentPlayerId) return undefined;
    var player = Players.findOne({_id: profile.currentPlayerId});
    if (!player) return undefined;
    return player.gameId;
}

function setCurrentPlayerId(id) {
    if (!Meteor.user()) {
        console.error("Setting current player but no user exists");
        return undefined;
    }
    Meteor.users.update({_id: Meteor.user()._id},
        {$set: {'profile.currentPlayerId': id}});
}

/**** Client Code****/
if (Meteor.isClient) {

  Template.home.helpers({
    joinedGame: function() {
      return currentGameId() != undefined
    },
    gameRunning: function() {
      var game = Games.findOne({id: currentGameId()});
      if (game == undefined) return false;
      return game.started && !game.finished;
    }
  });
  Template.create.helpers({
    errorMessage: function() {
      return Session.get("createErrorMessage");
    }
  });

  Template.create.events({
    "submit form": function(event) {
      event.preventDefault();
      var gameId = event.target.name.value;
      var mailingList = event.target.list.value;
      var game = Games.findOne({
        "id": gameId
      });

      if (game) {
        Session.set("createErrorMessage",
                    "A game already exists with that name");
        return;
      }

      if (!gameId) {
        Session.set("createErrorMessage",
                    "A game name is required.");
        return;
      }

      if (!mailingList) {
        Session.set("createErrorMessage",
                    "A mailing list is required.");
        return;
      }

      Games.insert({
        id: gameId,
        mailingList: mailingList,
        managerUserId: Meteor.user()._id,
        started: false,
        finished: false
      });
      Players.insert({
        gameId: gameId,
        userId: Meteor.user()._id
      }, function(err, playerId) {
        if (err) {
          console.error(err);
          Session.set("createErrorMessage", err);
        } else {
          setCurrentPlayerId(playerId);
          Router.go("/");
        }

      });
    }
  });

  Template.join.helpers({
    badGameId: function() {
      return Session.get("badGameId");
    }
  });

  Template.join.events({
    "submit form": function(event) {
      event.preventDefault();
      var gameId = event.target.name.value;
      var game = Games.findOne({
        "id": gameId
      });
      if (game) {
        Session.set("badGameId", undefined);
        Session.set("gameId", gameId);
        Router.go("/");
      } else {
        Session.set("badGameId", gameId);
      }
    }
  });

  Template.pregame.helpers({
      manager: function() {
        var player = Players.findOne({id: Meteor.user().profile.currentPlayerId});
        if (player == undefined) return false;
        var game = Games.findOne({id: player.gameId});
        return (game.managerUserId == Meteor.getUserId());
      }
  });
  Template.playerslist.helpers({
      players: function() {
        if (!currentGameId()) {
            console.error("Tried to view pregame without current game");
            return [];
        }
        var players = Players.find({gameId: currentGameId()});
        var managerUserId = Games.findOne({id: currentGameId()}).managerUserId;
        return players.map(function(player) {
            return {
                name: Meteor.users.findOne({_id: player.userId}),
                manager: managerUserId == player.userId
            }
        });
      }
  });


  Template.dashboard.events({
      "click button": function() {
        console.log("128");
        // get player's victim and send it to the killer
        var userId = Meteor.user()._id;
        currentGameId = currentGameId();
        console.log("131");
        var player = Players.findOne({
          gameId: currentGameId,
          userId: userId
        });
        console.log("135");
        var killer = Players.findOne({
            gameId: currentGameId,
            currentVictim: userId
        });
        console.log("137");
        Players.update({
            userId: killer.userId
        }, {
              $set: {currentVictim: player.currentVictim}
        });
        console.log("142");
        Players.update({
            iuserId: userId
        }, {
             $set: {alive: false}
        });
        console.log("email is trying to send");
        Email.send({
          "from": "assassins-master@mit.edu",
          "to": [
            killerInfo.email
           ],
          "subject": "your target is",
          "text": killerInfo.currentVictim,
          "html": '<h1 style="color: blue; background: red">MORE EXCITING</h1><br><span style="font-size:6pt">I apologize for that.</style>'
        });
      }
  });

  //against default signup, which asks for email  
  Accounts.ui.config({
    passwordSignupFields: "EMAIL_ONLY"
  });

}

if (Meteor.isServer) {
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
}


/*
Database Collections: Players and Games
Maybe we should sequester this somewhere else
*/
Games = new Mongo.Collection("games");
Players = new Mongo.Collection("players");

function load_sample_data() {
  //sample user
  Players.insert({
    userId: "unknownAnna",
    gameId: "Sample",
    alive: true,
    currentVictim: "JessId",
    victimList: []
  });
  Players.insert({
    userId: "unknownJess",
    gameId: "Sample",
    alive: true,
    currentVictim: "AndresId",
    victimList: []
  });
  Players.insert({
    userId: "unknownAndres",
    gameId: "Sample",
    alive: false,
    currentVictim: "MilesId",
    victimList: []
  });

  Players.insert({
    userId: "unknownMiles",
    gameId: "Sample",
    alive: false,
    currentVictim: "AnnaId",
    victimList: []
  });

  //sample game
  Games.insert({
    id: "Sample",
    mailingList: "super_assassins@mit.edu",
    managerUserId: "#(*$&#*$"
    started: false,
    finished: false
  });
}

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
