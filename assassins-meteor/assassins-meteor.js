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
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    users: function () {
      return Users.find({});
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
  Template.inGame.events({
      "I was killed": function() {
      // get user's victim and send it to the killer
          var userId = Meteor.userId();
          var state = Posts.findOne({
          id: userId
    });


       //Session.set(
      //}
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    process.env.MAIL_URL = "smtp://outgoing.mit.edu:25/"

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
  killer: "Andres"
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
