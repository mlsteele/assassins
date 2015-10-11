// Create fake users and stuff for testing.

fillDummyDb = function() {
  function createDummyUser(name) {
    Accounts.createUser({
      username: name,
      email: name + "@mit.edu2",
      password: "123456",
      profile: {}
    });
  }

  var usernames = ["one", "two", "three", "four",
                   "five", "six", "seven", "eight",
                   "nine", "ten"];

  usernames.forEach(createDummyUser);
}
