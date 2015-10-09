/*
Database collections and schemas.
*/

Schemas = {};

Games = new Mongo.Collection("games");

Schemas.Game = new SimpleSchema({
  id: {
    type: "String",
  },
  mailingList: {
    type: SimpleSchema.RegEx.Email,
    label: "A single email to send annoucements to."
  },
  managerUserId: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the managing user."
  },
  started: {
    type: "Boolean"
  },
  finished: {
    type: "Boolean"
  }
});

Games.attachSchema(Schemas.Game);


Players = new Mongo.Collection("players");

Schemas.Player = new SimpleSchema({
  gameId: {
    type: "String",
    label: "id of the Game this player is in."
  },
  userId: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the User of this player."
  },
  currentVictim: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the current victim",
    optional: true,
  },
  alive: {
    type: "Boolean",
    optional: true,
  },
  victimList: {
    type: Array,
    label: "_ids of players this one has killed.",
    optional: true,
  },
  "victimList.$": {
    type: SimpleSchema.RegEx.Id,
  }
});

Players.attachSchema(Schemas.Player);
