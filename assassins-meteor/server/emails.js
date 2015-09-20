Meteor.assassinsEmails = {}

Meteor.assassinsEmails.prefix = "[Assassins] "

// TODO: this is not correct.
Meteor.assassinsEmails.url = "http://assassins.xvm.mit.edu/"

Meteor.assassinsEmails.formatUser = function(user) {
  var displayName = user.profile.name;
  var email = user.emails[0].address;
  return "" + displayName + " (" + email + ")"
}

Meteor.assassinsEmails.invitation = function(to_email, game_name) {
  // You have been invited to a game of assassins.
  // Click this link sign up and join the game.
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": to_email,
    "subject": Meteor.assassinsEmails.prefix + "Invitation to play a game of assassins.",
    "text":
      "You have been invited to a game of assasssins!\n"+
      "Sign up and join the game '" + game_name + "'.\n"+
      Meteor.assassinsEmails.url
  });
}

Meteor.assassinsEmails.gameStarted = function(to_user, game_name, target_user) {
  // You have been invited to a game of assassins.
  // Here is your first targetd.
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": to_user.emails[0].address,
    "subject": Meteor.assassinsEmails.prefix + "The game has begun.",
    "text":
      "The game of assassins '" + game_name + "' has begun.\n" +
      "Your first target is " + Meteor.assassinsEmails.formatUser(target_user) + "\n" +
      "Good hunting."
  });
}

Meteor.assassinsEmails.announceDeath = function(to_email) {
  // Someone has died.
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": to_email,
    "subject": Meteor.assassinsEmails.prefix + "BOOM!",
    "text":
      "" + Meteor.assassinsEmails.formatUser(target_user) + " is dead."
  });
}

Meteor.assassinsEmails.kill_claim = function(target_user) {
  // Someone has claimed to have killed you.
  // Please log in and acknowledge your death.
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": target_user.emails[0].address,
    "subject": Meteor.assassinsEmails.prefix + "Did someone kill you?",
    "text":
      "Someone has claimed to have killed you.\n" +
      "I'm sorry for your loss.\n" +
      "If this is true please log in and acknowledge your demise.\n" +
      Meteor.assassinsEmails.url + "\n" +
      "If this is an error, consider sueing for redress of grievances."
  });
}

Meteor.assassinsEmails.nextTarget = function(hunter_user, target_user) {
  // Congratulations on killing your last target.
  // Here is your new target.
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": hunter_user.emails[0].address,
    "subject": Meteor.assassinsEmails.prefix + "Nice, next target.",
    "text":
      "Congratulations on killing your last target.\n" +
      "Your next target is " + Meteor.assassinsEmails.formatUser(target_user) + "\n" +
      "If you kill them, encourage them to log in and report their death\n" +
      Meteor.assassinsEmails.url
  });
}

Meteor.assassinsEmails.suddenDeath = function(to_email, game_name) {
  // Sudden death has begun!
  // There are only a few people left in the game.
  // You can kill anyone.
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": to_email,
    "subject": Meteor.assassinsEmails.prefix + "Sudden death.",
    "text":
      "Sudden death has begun in '"+game_name+"'!\n" +
      "There are only a few players left in the game.\n" +
      "You can kill anyone you want now.\n" +
      "If you kill someone, encourage them to log in and report their death\n" +
      Meteor.assassinsEmails.url
  });
}

Meteor.assassinsEmails.gameOverWin = function(winner_user, game_name) {
  // The game is over. You won!
  // Check here for some stats.
  // TODO: stats link
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": winner_user.emails[0].address,
    "subject": Meteor.assassinsEmails.prefix + "You win!",
    "text":
      "The game '"+game_name+"' is over, you have slain them all!\n" +
      "Well done."
  });
}

Meteor.assassinsEmails.gameOverLose = function(winner_user, game_name) {
  // The game is over. You lost!
  // Check here for some stats.
  // TODO: stats link
  Email.send({
    "from": "assassins-master@mit.edu",
    "to": winner_user.emails[0].address,
    "subject": Meteor.assassinsEmails.prefix + "Game over.",
    "text":
      "The game '"+game_name+"' is over.\n" +
      "As you know, you were on of the deceased this time.\n" +
      "Better luck next time."
  });
}
