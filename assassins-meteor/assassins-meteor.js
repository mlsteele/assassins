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

/**** Helper Functions ****/
function currentGameId() {
    var profile = Meteor.user().profile;
    if (!profile) return undefined;
    if (!profile.currentGameId) return undefined;
    return profile.currentGameId;
}

/**** Client Code****/
if (Meteor.isClient) {
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
        managerId: "Jess" // TODO, no fair
      });
      Session.set("gameId", gameId);
      Session.set("createErrorMessage", undefined);
      Router.go("/");
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
      console.log("Joining " + gameId);
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
        var user = Users.findOne({id: Session.get("currentUser")});
        if (user == undefined) return false;
        var game = Games.findOne({id: user.gameId});
        return (game.managerId == user.id);
      }
  });
  Template.playerslist.helpers({
      players: function() {
        var users = Users.find({gameId: currentGameId()});
        var managerId = Games.findOne({id: currentGameId()}).managerId;
        return users.map(function(user) {
            return {
                name: user.id,
                manager: managerId == user.id
            }
        });
      }
  });


  Template.dashboard.events({
      "click button": function() {
        console.log("here we are");
        // get user's victim and send it to the killer
        var userId = Meteor.userId();
        var userInfo = Posts.findOne({
          id: userId
        });
        var killerId = userInfo.killerId;
        Posts.update({
            id: killerId
        }, {
              $set: {currentVictim: userInfo.currentVictim}
        });
        var killerInfo = Post.findOne({
          id: killerId
        });
        Posts.update({
            id: userId
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

      var users = Users.find({"gameId": gameId}).fetch();
      users = shuffleArray(users);
      for (var i = 0; i < users.length; i++) {
        var u1 = users[i];
        var u2 = users[(i + 1) % users.length];
        u1.currentVictim = u2.id;
        u1.alive = true;
        u1.killerId = undefined;
        u1.victimList = [];
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
    id: "Anna",
    email: "super_assassin@mit.edu",
    killer_id: "Andres",
    gameId: "Sample",
    alive: true,
    currentVictim: "Jess",
    victimList: []
  });
  Players.insert({
    id: "Jess",
    email: "jessk@mit.edu",
    killerId: "Anna",
    gameId: "Sample",
    alive: true,
    currentVictim: "Andres",
    victimList: []
  });
  Players.insert({
    id: "Andres",
    email: "anpere@mit.edu",
    killerId: "Jess",
    gameId: "Sample",
    alive: false,
    currentVictim: "Miles",
    victimList: []
  });

  Players.insert({
    id: "Miles",
    email: "anpere@mit.edu",
    killerId: "Jess",
    gameId: "Sample",
    alive: false,
    currentVictim: "Anna",
    victimList: []
  });

  //sample game
  Games.insert({
    id: "Sample",
    mailingList: "super_assassins@mit.edu",
    managerId: "Jess"
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
