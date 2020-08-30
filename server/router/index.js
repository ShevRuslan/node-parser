const express = require('express');
const router = express.Router();
const WeaponClass = require('../modules/weapon');
const { getInfo, getStattrackWeapon, getSouvenirWeapon, getWeapon, getKnife, getGloves } = new WeaponClass();



router.get('/getWeapons', getInfo);
router.get('/getWeapon', getWeapon);
router.get('/getKnife', getKnife);
router.get('/getGloves', getGloves);
router.get('/getWeaponBy', getWeapon);
router.get('/getStattrack', getStattrackWeapon);
router.get('/getSouvenir', getSouvenirWeapon);
module.exports = router;