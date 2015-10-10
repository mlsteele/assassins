/*
Database collections and schemas.
*/

Schemas = {};

Games = new Mongo.Collection("games");
if (Meteor.isServer) {
  Games._ensureIndex({name: 1}, {unique: 1});
}

Schemas.Game = new SimpleSchema({
  name: {
    type: "String",
    label: "Name of the game."
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
if (Meteor.isServer) {
  Players._ensureIndex({userId: 1, gameId: 1}, {unique: 1});
}

Schemas.Player = new SimpleSchema({
  userId: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the User of this player."
  },
  gameId: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the Game this player is in."
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
