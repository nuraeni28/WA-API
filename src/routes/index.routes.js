const router = require('express').Router();
const register = require('./register.routes');
const login = require('./login.routes');
const checkOTP = require('./otp.routes');

router.post('/checkOTP', checkOTP);
router.post('/login', login);
router.post('/register', register);
// router.post("/verify",  verifyOTP);

module.exports = router;
