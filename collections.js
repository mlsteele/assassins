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


Characters = new Mongo.Collection("characters");
if (Meteor.isServer) {
  Characters._ensureIndex({userId: 1, gameId: 1}, {unique: 1});
}

Schemas.Character = new SimpleSchema({
  userId: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the User of this Character."
  },
  gameId: {
    type: SimpleSchema.RegEx.Id,
    label: "_id of the Game this Character is in."
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
    label: "_ids of Characters this one has killed.",
    optional: true,
  },
  "victimList.$": {
    type: SimpleSchema.RegEx.Id,
  }
});

Characters.attachSchema(Schemas.Character);
