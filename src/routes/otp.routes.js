const router = require('express').Router();
const { checkOTP } = require('../controllers/otp.controller');

router.post('/checkOTP', checkOTP);

module.exports = router;
