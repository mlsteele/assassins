/**** Helper Functions ****/

function getCurrentPlayer() {
    if (!Meteor.user()) return undefined;
    var profile = Meteor.user().profile;
    if (!profile) return undefined;
    if (!profile.currentPlayerId) return undefined;
    return Players.findOne({_id: profile.currentPlayerId});
}

function getCurrentGameId() {
    var player = getCurrentPlayer();
    if (!player) return undefined;
    return player.gameId;
}

function getCurrentClues() {
    var player = getCurrentPlayer();
    if (!player) return undefined;
    return player.currentClues;
}

function setCurrentPlayerId(id) {
    if (!Meteor.user()) {
        console.error("Setting current player but no user exists");
        return undefined;
    }
    Meteor.users.update({_id: Meteor.user()._id},
        {$set: {'profile.currentPlayerId': id}});
}

// Set the users active game.
function joinGame(gameId) {
  // Use an existing player if one exists.
  var player = Players.findOne({
    gameId: gameId,
    userId: Meteor.userId()
  });
  var game = Games.findOne({id: gameId});
  if (game && (game.started == true || game.finished == true)) {
    console.err("Cannot start a game that already started");
    return;
  }

  if (player) {
    setCurrentPlayerId(player._id);
  } else {
    // Create a Player if there isn't one.
    Players.insert({
      gameId: gameId,
      userId: Meteor.user()._id
    }, function(err, playerId) {
      if (err) {
        console.error(err);
      } else {
        setCurrentPlayerId(playerId);
      }
    });
  }
}

function setCurrentUserName(name) {
    if (!Meteor.user()) {
        console.error("Setting user name before user is loaded");
        return undefined;
    }
    Meteor.users.update({_id: Meteor.user()._id},
        {$set: {'profile.name': name}});
}

function getCurrentUserName() {
    if (Meteor.user()) {
        if (Meteor.user().profile && Meteor.user().profile.name) {
            return Meteor.user().profile.name;
        } else {
            return Meteor.user().emails[0].address.split("@")[0];
        }
    }
}

/**** Client Code****/


Template.home.helpers({
  joinedGame: function() {
    return getCurrentGameId() != undefined
  },
  gameRunning: function() {
    var gameId = getCurrentGameId();
    if (gameId == undefined) return false;
    var game = Games.findOne({id: gameId});
    if (game == undefined) return false;
    return game.started && !game.finished;
  },
  gameCanceled: function() {
    var gameId = getCurrentGameId();
    if (gameId == undefined) return false;
    var game = Games.findOne({id: gameId});
    if (game== undefined) return false;
    return !game.started && game.finished;
  }
});

Template.nogame.helpers({
  joining: function() {
    return Session.get("nogameAction") === "join";
  },
  creating: function() {
    return Session.get("nogameAction") === "create";
  }
});

Template.nogame.events({
  "click button.nogame-join": function(event) {
    event.preventDefault();
    Session.set("nogameAction", "join");
  },
  "click button.nogame-create": function(event) {
    event.preventDefault();
    Session.set("nogameAction", "create");
  }
});

Template.create.helpers({
  errorMessage: function() {
    return Session.get("createErrorMessage");
  },
  displayName: function() {
    return getCurrentUserName();
  }
});

Template.create.events({
  "submit form": function(event) {
    event.preventDefault();
    setCurrentUserName(event.target.username.value);
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

    Session.set("createErrorMessage", undefined);

    joinGame(gameId);

    Meteor.call("createGame", mailingList, gameId, function(error,result) {
      if (error) {
        console.error(error);
      }
    });
  }
});

Template.join.helpers({
  badGameId: function() {
    return Session.get("badGameId");
  },
  displayName: function() {
    return getCurrentUserName();
  }
});

Template.join.events({
  "submit form": function(event) {
    event.preventDefault();
    setCurrentUserName(event.target.username.value);
    var gameId = event.target.name.value;
    var game = Games.findOne({
      "id": gameId
    });
    if (game && !game.started && !game.finished) {
      Session.set("badGameId", undefined);
      joinGame(gameId);
    } else {
      Session.set("badGameId", gameId);
    }
  }
});
Template.pregame.events({
  "click .startButton": function(event) {
    event.preventDefault();
    var gameId = getCurrentGameId();
    console.log("push startButton");
    Meteor.call('initializeGame',gameId, function (error, result) {
      console.log("error",error);
      console.log("result", result);
      if (error) {
        console.error(error || result.error);
      } else {
        // console.log("initialized game");
        // console.log(gameId);
        console.log('bye-bye');
      }
    });
  },
  "click .cancelButton": function(event) {
    event.preventDefault();
    var gameId = getCurrentGameId();
    var game = Games.findOne({
        "_id":gameId
    });
    Meteor.call('cancelGame', gameId, function(error,result) {
        if (error) {
            // handle error
        } else {
        }
    });
    console.log("pushed cancelButton");
  }
});
Template.pregame.helpers({
    manager: function() {
      var game = Games.findOne({
        "id": getCurrentGameId()
      });
      return (game.managerUserId == Meteor.userId());
    },
    name: function() {
      return Games.findOne({id: getCurrentGameId()}).id
    },
    count: function() {
      return Players.find({gameId: getCurrentGameId()}).fetch().length;
    }
});

Template.playerslist.helpers({
    players: function() {
      if (!getCurrentGameId()) {
          console.error("Tried to view pregame without current game");
          return [];
      }
      var players = Players.find({gameId: getCurrentGameId()});
      var managerUserId = Games.findOne({id: getCurrentGameId()}).managerUserId;
      return players.map(function(player) {
        var user = Meteor.users.findOne({_id: player.userId})
        return {
          name: user.profile.name,
          manager: managerUserId == player.userId
        }
      });
    }
});

Template.dashboard.helpers({
    target: function() {
        var player = getCurrentPlayer();
        var targetId = player.currentVictim;
        var targetPlayer = Players.findOne({_id: targetId});
        var targetUser = Meteor.users.findOne({_id: targetPlayer.userId});
        return targetUser.profile.name;
    }
});
Template.dashboard.events({
    "click .die": function() {
      // get player's victim and send it to the killer
      var player = getCurrentPlayer();
      var killer = Players.findOne({
          gameId: getCurrentGameId(),
          currentVictim: player._id
      });
      if (killer) {
        Players.update({
            _id: killer._id
        }, {
            $set: {currentVictim: player.currentVictim}
        });
        Meteor.call('newTarget', killer, function(error,result) {
          if (error) {
            console.error(error);
          }
        });
      } else {
          console.error("Unexpected no killer for player ", player);
      }
      Players.update({
          _id: player._id
      }, {
           $set: {alive: false}
      });

    },

    "click .guess": function() {
      Router.go("/guess");
    }
});
Template.canceled.helpers({
  name : function () {
    return Games.findOne({id: getCurrentGameId()}).id
    }
});
//against default signup, which asks for email
Accounts.ui.config({
  passwordSignupFields: "EMAIL_ONLY"
});
