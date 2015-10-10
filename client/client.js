/**** Helper Functions ****/

function getCurrentCharacter() {
    if (!Meteor.user()) return undefined;
    var profile = Meteor.user().profile;
    if (!profile) return undefined;
    if (!profile.currentCharacterId) return undefined;
    return Characters.findOne({_id: profile.currentCharacterId});
}

function getCurrentGameId() {
    var character = getCurrentCharacter();
    if (!character) return undefined;
    return character.gameId;
}

function getCurrentClues() {
    var character = getCurrentCharacter();
    if (!character) return undefined;
    return character.currentClues;
}

function setCurrentCharacterId(id) {
    if (!Meteor.user()) {
        console.error("Setting current Character but no user exists");
        return undefined;
    }
    Meteor.users.update({_id: Meteor.user()._id},
        {$set: {'profile.currentCharacterId': id}});
}

// Set the users active game.
function joinGame(gameId) {
  // Use an existing character if one exists.
  var character = Characters.findOne({
    gameId: gameId,
    userId: Meteor.userId()
  });
  var game = Games.findOne({_id: gameId});
  if (game && (game.started == true || game.finished == true)) {
    console.err("Cannot start a game that already started");
    return;
  }

  if (character) {
    setCurrentCharacterId(character._id);
  } else {
    // Create a Character if there isn't one.
    Characters.insert({
      gameId: gameId,
      userId: Meteor.user()._id
    }, function(err, characterId) {
      if (err) {
        console.error(err);
      } else {
        setCurrentCharacterId(characterId);
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
        } else if (Meteor.user().emails) {
            return Meteor.user().emails[0].address.split("@")[0];
        }
    }
}

/**** Client Code****/


Template.home.helpers({
  joinedGame: function() {
    console.log("joinedGame ",getCurrentGameId() != undefined)
    return getCurrentGameId() != undefined
  },
  gameRunning: function() {
    var gameId = getCurrentGameId();
    if (gameId == undefined) return false;
    var game = Games.findOne({_id: gameId});
    if (game == undefined) return false;
    console.log("game started",game.started);
    console.log("game finished",game.finished);
    console.log("game running ", game.started && !game.finished)
    return game.started && !game.finished;
  },
  gameFinished: function() {
    var gameId = getCurrentGameId();
    if (gameId == undefined) return false;
    var game = Games.findOne({_id: gameId});
    if (game== undefined) return false;
    return game.finished;
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
    var gameName = event.target.name.value;
    var mailingList = event.target.list.value;
    var game = Games.findOne({
      "name": gameName
    });

    if (game) {
      Session.set("createErrorMessage",
                  "A game already exists with that name");
      return;
    }

    if (!gameName) {
      Session.set("createErrorMessage",
                  "A game name is required.");
      return;
    }

    if (!mailingList) {
      Session.set("createErrorMessage",
                  "A mailing list is required.");
      return;
    }

    Session.set("createErrorMessage", undefined);

    Games.insert({
      name: gameName,
      mailingList: mailingList,
      managerUserId: Meteor.user()._id,
      started: false,
      finished: false
    }, function(err, gameId) {
      if (err) { throw err; }
      joinGame(gameId);

      Meteor.call("createGame", mailingList, gameId, function(error,result) {
        if (error) {
          console.error(error);
        }
      });
    });
  }
});

Template.join.helpers({
  badGameName: function() {
    return Session.get("badGameName");
  },
  displayName: function() {
    return getCurrentUserName();
  }
});

Template.join.events({
  "submit form": function(event) {
    event.preventDefault();
    setCurrentUserName(event.target.username.value);
    var gameName = event.target.name.value;
    var game = Games.findOne({
      name: gameName
    });
    if (game && !game.started && !game.finished) {
      Session.set("badGameName", undefined);
      joinGame(gameName);
    } else {
      Session.set("badGameName", gameName);
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
  // THIS HERE IS SO BROKEN DON"T EVEN TRY USING IT
  // DON"T FORGET TO FIX IT. IT DOESN"T UPDATE THE GAME
  // STATUS TO FINISHED ON THE CLIENT SIDE -- ANPERE
  "click .cancelButton": function(event) {
    event.preventDefault();
    var gameId = getCurrentGameId();
    var character = getCurrentCharacter();
    console.log(gameId)
    var game = Games.findOne({
        _id: gameId
    });
    console.log("Client: calling server to cancel game")
    Meteor.call('cancelGame', gameId, function(error,result) {
        if (error) {
            // handle error
        } else {
        }
    console.log(game);
    });
    console.log("updating client game");
    Games.update({
            _id: game._id
        }, {
            $set: {finished: true}
        });
    console.log("canceled game!")
    Characters.update({
            _id: character._id
        }, { 
            $set: {gameId: undefined}
        });
  },
  "click #leavePregame": function(event) {
      event.preventDefault();
      Characters.remove({_id: getCurrentCharacter()._id});
      setCurrentCharacterId(undefined);
      //TODO fix set is empty error
  }
});
Template.pregame.helpers({
    manager: function() {
      var game = Games.findOne({
        _id: getCurrentGameId()
      });
      return (game.managerUserId == Meteor.userId());
    },
    name: function() {
      return Games.findOne({_id: getCurrentGameId()}).id
    },
    count: function() {
      return Characters.find({gameId: getCurrentGameId()}).fetch().length;
    }
});

Template.playerslist.helpers({
    players: function() {
      if (!getCurrentGameId()) {
          console.error("Tried to view pregame without current game");
          return [];
      }
      var characters = Characters.find({gameId: getCurrentGameId()});
      var managerUserId = Games.findOne({_id: getCurrentGameId()}).managerUserId;
      return characters.map(function(character) {
        var user = Meteor.users.findOne({_id: character.userId})
        return {
          name: user.profile.name,
          isManager: managerUserId == character.userId
        }
      });
    }
});

Template.dashboard.helpers({
    target: function() {
        var character = getCurrentCharacter();
        var targetId = character.currentVictim;
        var targetCharacter = Characters.findOne({_id: targetId});
        var targetUser = Meteor.users.findOne({_id: targetCharacter.userId});
        return targetUser.profile.name;
    }
});
Template.dashboard.events({
    "click .die": function() {
      // get character's victim and send it to the killer
      var character = getCurrentCharacter();
      var killer = Characters.findOne({
          gameId: getCurrentGameId(),
          currentVictim: character._id
      });
      if (killer) {
        Characters.update({
            _id: killer._id
        }, {
            $set: {currentVictim: character.currentVictim}
        });
        Meteor.call('newTarget', killer, function(error,result) {
          if (error) {
            console.error(error);
          }
        });
      } else {
          console.error("Unexpected no killer for character ", character);
      }
      Characters.update({
          _id: character._id
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
    return Games.findOne({_id: getCurrentGameId()}).id
    }
});
Template.canceled.events({
  "click .leaveGame": function() {
  console.log("characterId set to undefined");
  }
});
//against default signup, which asks for email
Accounts.ui.config({
  passwordSignupFields: "EMAIL_ONLY"
});
