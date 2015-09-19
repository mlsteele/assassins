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
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
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
  gameID: "Sample",
  status: "Dead",
  current_victim: "Jess",
  victim_list: []
});

//sample game
Games.insert({
  id: "Sample",
  mailing_list: "pookie@mit.edu"
});
