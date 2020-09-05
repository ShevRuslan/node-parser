const express = require('express');
const router = express.Router();
const WeaponClass = require('../modules/weapon');
const { getInfo, getCountWeapons, getWeapon } = new WeaponClass();



router.get('/getWeapons', getInfo);
router.get('/getWeapon', getWeapon);
router.get('/getCountItems', getCountWeapons);
module.exports = router;