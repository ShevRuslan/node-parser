const express = require('express');
const router = express.Router();
const WeaponClass = require('../modules/weapon');
const { getInfo, getStattrackWeapon, getSouvenirWeapon, getWeapon, getKnife, getGloves, searchByName, searchBetweenPrice } = new WeaponClass();



router.get('/getWeapons', getInfo);
router.get('/getWeapon', getWeapon);
router.get('/getKnife', getKnife);
router.get('/getGloves', getGloves);
router.get('/getWeaponBy', getWeapon);
router.get('/getStattrack', getStattrackWeapon);
router.get('/getSouvenir', getSouvenirWeapon);
router.get('/searchByName', searchByName);
router.get('/searchBetweenPrice', searchBetweenPrice)
module.exports = router;