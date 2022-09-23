const router = require('express').Router();
const checkOTP = require('./otp.routes');

router.post('/checkOTP', checkOTP);
// router.post("/register",register);
// router.post("/login", validationLogin,runValidation, login);
// router.post("/verify",  verifyOTP);

module.exports = router;
