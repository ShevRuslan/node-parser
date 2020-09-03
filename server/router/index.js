const express = require('express');
const router = express.Router();
const WeaponClass = require('../modules/weapon');
const { getInfo, getStattrackWeapon, getSouvenirWeapon, getWeapon, getKnife, getGloves, searchByName, searchBetweenPrice } = new WeaponClass();



router.get('/getWeapons', getInfo);
router.get('/getWeapon', getWeapon);
module.exports = router;