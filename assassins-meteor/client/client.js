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
Template.init.events({
  "submit form": function(event) {
  var gameId = event.target
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
