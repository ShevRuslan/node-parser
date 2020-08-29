const express = require('express');
const router = express.Router();
const WeaponClass = require('../modules/weapon');
const { getInfo } = new WeaponClass();



router.get('/getWeapons',getInfo);


module.exports = router;