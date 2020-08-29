const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const weapon = new Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
    },
    'price-steam': {
      type: Number,
      required: true,
    },
    'price-autobuy': {
      type: Number,
      required: false,
    },
    'percentage-market-steam': {
      type: Number,
      required: false,
    },
    'percentage-market-autobuy': {
      type: Number,
      required: false,
    },
    'link': {
      type: String,
      required: true,
    },
    'type': {
      type: String,
      required: true,
    },
    'type_weapon': {
      type: String,
      required: false,
    },
    'isStatTrak': {
      type: Boolean,
      default: false,
    },
    _id: Number
  },
  { _id: false, versionKey: false }
);

weapon.plugin(AutoIncrement);

module.exports = model('Weapon', weapon);