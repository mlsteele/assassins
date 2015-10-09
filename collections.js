/*
Database Collections: Players and Games
*/
Games = new Mongo.Collection("games");
Players = new Mongo.Collection("players");

function load_sample_data() {
  //sample user
  Players.insert({
    userId: "unknownAnna",
    gameId: "Sample",
    alive: true,
    currentVictim: "JessId",
    victimList: []
  });
  Players.insert({
    userId: "unknownJess",
    gameId: "Sample",
    alive: true,
    currentVictim: "AndresId",
    victimList: []
  });
  Players.insert({
    userId: "unknownAndres",
    gameId: "Sample",
    alive: false,
    currentVictim: "MilesId",
    victimList: []
  });

  Players.insert({
    userId: "unknownMiles",
    gameId: "Sample",
    alive: false,
    currentVictim: "AnnaId",
    victimList: []
  });

  //sample game
  Games.insert({
    id: "Sample",
    mailingList: "super_assassins@mit.edu",
    managerUserId: "#(*$&#*$",
    started: false,
    finished: false
  });
}
