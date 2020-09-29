const express = require('express');
const router = express.Router();
const WeaponClass = require('../modules/weapon');
const { getWeapon } = new WeaponClass();

router.get('/getWeapon', getWeapon);
module.exports = router;