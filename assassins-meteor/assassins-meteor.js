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
if (Meteor.isClient) {
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
      } else {
        Session.set("bad_game_id", game_id);
      }
    }
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
}


/*
Database Collections: Users and Games
Maybe we should sequester this somewhere else
*/
Games = new Mongo.Collection("games");
Users = new Mongo.Collection("users");

//sample user
Users.insert({
  id: "Anna",
  email: "super_assassin@mit.edu",
  killer: "Andres",
  gameID: "Sample",
  status: "Dead",
  current_victim: "Jess",
  victim_list: []
});

//sample game
Games.insert({
  id: "Sample",
  mailing_list: "super_assassins@mit.edu"
});
