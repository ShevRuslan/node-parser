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
    percent: {
      type: Number,
      required: false,
      default: '',
    },
    "price-first": {
      type: Number,
      required: false,
      default: '',
    },
    "price-second": {
      type: Number,
      required: false,
      default: '',
    },
    "price-buff-CNY": {
      type: Number,
      required: true,
    },
    "price-buff-RUB": {
      type: Number,
      required: true,
    },
    "price-buff-USD": {
      type: Number,
      required: true,
    },
    'price-steam-CNY': {
      type: Number,
      required: true,
    },
    'price-steam-RUB': {
      type: Number,
      required: true,
    },
    'price-steam-USD': {
      type: Number,
      required: true,
    },
    'price-autobuy-CNY': {
      type: Number,
      required: false,
    },
    'price-autobuy-RUB': {
      type: Number,
      required: false,
    },
    'price-autobuy-USD': {
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
    'additional_type': {
      type: String,
      required: false,
    },
    _id: Number
  },
  { _id: false, versionKey: false, strict: false }
);

weapon.plugin(AutoIncrement);

module.exports = model('Weapon', weapon);