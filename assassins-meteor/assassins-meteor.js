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
Router.route('/login', {
    template: 'login'
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
    var user = Users.findOne(Session.get("currentUser"));
    if (user != undefined) return user.gameId;
}


/**** Client Code****/
if (Meteor.isClient) {
  Template.create.helpers({
    error_message: function() {
      return Session.get("create_error_message");
    }
  });

  Template.create.events({
    "submit form": function(event) {
      event.preventDefault();
      var game_id = event.target.name.value;
      var mailing_list = event.target.list.value;
      var game = Games.findOne({
        "id": game_id
      });

      if (game) {
        Session.set("create_error_message",
                    "A game already exists with that name");
        return;
      }

      if (!game_id) {
        Session.set("create_error_message",
                    "A game name is required.");
        return;
      }

      if (!mailing_list) {
        Session.set("create_error_message",
                    "A mailing list is required.");
        return;
      }

      Games.insert({
        id: game_id,
        mailing_list: mailing_list,
        manager_id: "Jess" // TODO, no fair
      });
      Session.set("game_id", game_id);
      Session.set("create_error_message", undefined);
      Router.go("/");
    }
  });

  Template.join.helpers({
    bad_game_id: function() {
      return Session.get("bad_game_id");
    }
  });

  Template.join.events({
    "submit form": function(event) {
      event.preventDefault();
      var game_id = event.target.name.value;
      var game = Games.findOne({
        "id": game_id
      });
      console.log("Joining " + game_id);
      if (game) {
        Session.set("bad_game_id", undefined);
        Session.set("game_id", game_id);
        Router.go("/");
      } else {
        Session.set("bad_game_id", game_id);
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
              $set: {current_victim: userInfo.current_victim}
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
          "text": killerInfo.current_victim,
          "html": '<h1 style="color: blue; background: red">MORE EXCITING</h1><br><span style="font-size:6pt">I apologize for that.</style>'
        });
      }
  });
  
  Template.login.events({
    "submit form": function(event) {
      event.preventDefault();
      var user = Users.findOne({
        "id": event.target.username.value
      });
      if (user) {
        Session.set("currentUser", user)
        Router.go('dashboard');
      } else {
        alert("User does not exist");
      }
    }
  });

  Template.home.helpers({
    currentUser: function() {
      return Session.get("currentUser");
    }
  })
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
    initializeGame: function(game_id) {
      var game = Games.findOne({"id": game_id});
      if (!game) {
        return {"status": "failed", "error": "No such game."}
      }

      var users = Users.find({"gameID": game_id}).fetch();
      users = shuffleArray(users);
      for (var i = 0; i < users.length; i++) {
        var u1 = users[i];
        var u2 = users[(i + 1) % users.length];
        u1.current_victim = u2.id;
        u1.alive = true;
        u1.killerId = undefined;
        u1.victim_list = [];
      }
    }
  });
}


/*
Database Collections: Users and Games
Maybe we should sequester this somewhere else
*/
Games = new Mongo.Collection("games");
Users = new Mongo.Collection("users");

function load_sample_data() {
  //sample user
    Users.insert({
    id: "Anna",
    email: "super_assassin@mit.edu",
    killer_id: "Andres",
    gameID: "Sample",
    alive: true,
    current_victim: "Jess",
    victim_list: []
  });
  Users.insert({
    id: "Jess",
    email: "jessk@mit.edu",
    killerId: "Anna",
    gameID: "Sample",
    alive: true,
    current_victim: "Andres",
    victim_list: []
  });
  Users.insert({
    id: "Andres",
    email: "anpere@mit.edu",
    killerId: "Jess",
    gameID: "Sample",
    alive: false,
    current_victim: "Anna",
    victim_list: []
  });

  //sample game
  Games.insert({
    id: "Sample",
    mailing_list: "super_assassins@mit.edu",
    manager_id: "Jess"
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
