const router = require('express').Router();
const { register } = require('../controllers/register.controller');
const { runValidation, validationRegister } = require('../middleware/validation.middleware');

router.post('/register', validationRegister, runValidation, register);

module.exports = router;
