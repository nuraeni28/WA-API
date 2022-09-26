const router = require('express').Router();
const login = require('./login.routes');
const checkOTP = require('./otp.routes');

router.post('/checkOTP', checkOTP);
router.post('/login', login);
// router.post("/verify",  verifyOTP);

module.exports = router;
