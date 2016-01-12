Meteor.assassinsEmails = {}

Meteor.assassinsEmails.prefix = "[Assassins] "

// TODO: this is not correct.
Meteor.assassinsEmails.url = "http://assassins.xvm.mit.edu/"

function emailAddress(user) {
  if (user.emails != undefined && user.emails.length > 0) {
    return user.emails[0].address;
  } else if (user.services != undefined && user.services.google != undefined) {
    return user.services.google.email;
  } else {
    console.error("NO EMAIL FOR USER");
  }
}

Meteor.assassinsEmails.formatUser = function(user) {
  var displayName = user.profile.name;
  var email = emailAddress(user);
  return "" + displayName + " (" + email + ")"
}

var sendEmail = function(parameters) {
  if (Meteor.settings.email_suppress) {
    console.log("Suppressed email", parameters);
  } else {
    console.log("Sending email", parameters);
    Email.send(parameters);
  }
}

Meteor.assassinsEmails.invitation = function(to_email, game_name) {
  // You have been invited to a game of assassins.
  // Click this link sign up and join the game.
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": to_email,
    "subject": Meteor.assassinsEmails.prefix + "Invitation to play a game of assassins.",
    "text":
      "You have been invited to a game of assasssins!\n"+
      "Sign up and join the game '" + game_name + "'.\n"+
      Meteor.assassinsEmails.url
  });
}

Meteor.assassinsEmails.cancelled = function(to_email, game_name) {
  // This game has been cancelled.

  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": to_email,
    "subject": Meteor.assassinsEmails.prefix + "Game cancelled.",
    "text":
      "The game '"+game_name+"' has been cancelled."
  });
}

Meteor.assassinsEmails.gameStarted = function(to_user, game_name, target_user) {
  // You have been invited to a game of assassins.
  // Here is your first targetd.
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": emailAddress(to_user),
    "subject": Meteor.assassinsEmails.prefix + "The game has begun.",
    "text":
      "The game of assassins '" + game_name + "' has begun.\n" +
      "Your first target is " + Meteor.assassinsEmails.formatUser(target_user) + "\n" +
      "Good hunting."
  });
}

Meteor.assassinsEmails.announceDeath = function(to_email) {
  // Someone has died.
  sendEmail({
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
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": emailAddress(target_user),
    "subject": Meteor.assassinsEmails.prefix + "Did someone kill you?",
    "text":
      "Someone has claimed to have killed you.\n" +
      "I'm sorry for your loss.\n" +
      "If this is true please log in and acknowledge your demise.\n" +
      Meteor.assassinsEmails.url + "\n" +
      "If this is an error, consider sueing for redress of grievances."
  });
}

Meteor.assassinsEmails.killedTarget = function(hunter_user, target_user) {
  // Congratulations on killing your last target.
  // Here is your new target.
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": emailAddress(hunter_user),
    "subject": Meteor.assassinsEmails.prefix + "Nice, next target.",
    "text":
      "Congratulations on killing your last target.\n" +
      "Your next target is " + Meteor.assassinsEmails.formatUser(target_user) + "\n" +
      "If you kill them, encourage them to log in and report their death\n" +
      Meteor.assassinsEmails.url
  });
}

Meteor.assassinsEmails.nextTarget = function(hunter_user, target_user) {
  // You got a new target because of something other than killing your thing.
  // Here is your new target.
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": emailAddress(hunter_user),
    "subject": Meteor.assassinsEmails.prefix + "You have a new target.",
    "text":
      "You have a new target. Your old target must have fallen out a window or something.\n" +
      "Your next target is " + Meteor.assassinsEmails.formatUser(target_user) + "\n" +
      "If you kill them, encourage them to log in and report their death\n" +
      Meteor.assassinsEmails.url
  });
}

Meteor.assassinsEmails.suddenDeath = function(to_email, game_name) {
  // Sudden death has begun!
  // There are only a few people left in the game.
  // You can kill anyone.
  sendEmail({
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
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": emailAddress(winner_user),
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
  sendEmail({
    "from": "assassins-master@mit.edu",
    "to": emailAddress(winner_user),
    "subject": Meteor.assassinsEmails.prefix + "Game over.",
    "text":
      "The game '"+game_name+"' is over.\n" +
      "As you know, you were on of the deceased this time.\n" +
      "Better luck next time."
  });
}
