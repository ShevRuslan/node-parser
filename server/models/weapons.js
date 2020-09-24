const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const weapon = new Schema(
  {
    id: {
      type: Number,
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: true
    },
    percent: {
      type: Number,
      required: false,
      default: null,
    },
    "price-first": {
      type: Number,
      required: false,
      default: null,
    },
    "price-second": {
      type: Number,
      required: false,
      default: null,
    },
    "price-buff-CNY": {
      type: Number,
      required: false,
      default: null,
    },
    "price-buff-RUB": {
      type: Number,
      required: false,
      default: null,
    },
    "price-buff-USD": {
      type: Number,
      required: false,
      default: null,
    },
    'price-steam-CNY': {
      type: Number,
      required: false,
      default: null,
    },
    'price-steam-RUB': {
      type: Number,
      required: false,
      default: null,
    },
    'price-steam-USD': {
      type: Number,
      required: false,
      default: null,
    },
    'price-autobuy-CNY': {
      type: Number,
      required: false,
      default: null,
    },
    'price-autobuy-RUB': {
      type: Number,
      required: false,
      default: null,
    },
    'price-autobuy-USD': {
      type: Number,
      required: false,
      default: null,
    },
    'price-csgotm-CNY': {
      type: Number,
      default: null,
      required: false,
    },
    'price-csgotm-RUB': {
      type: Number,
      default: null,
      required: false,
    },
    'price-csgotm-USD': {
      type: Number,
      default: null,
      required: false,
    },
    'price-csgotm-autobuy-CNY': {
      type: Number,
      default: null,
      required: false,
    },
    'price-csgotm-autobuy-RUB': {
      type: Number,
      default: null,
      required: false,
    },
    'price-csgotm-autobuy-USD': {
      type: Number,
      default: null,
      required: false,
    },
    'link': {
      type: String,
      required: false,
      default: null,
    },
    'type': {
      type: String,
      required: false,
      default: null,
    },
    'type_weapon': {
      type: String,
      required: false,
      default: null,
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