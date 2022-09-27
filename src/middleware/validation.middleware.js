/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable consistent-return */
const { check, validationResult } = require('express-validator');
const { User } = require('../models/user');

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'failed',
      errors: errors.array(),
    });
  }
  next();
};

exports.validationRegister = [
  check('name', 'name cannot empty').notEmpty(),
  check('wa').notEmpty().withMessage('wa cannot empty')
  // eslint-disable-next-line no-useless-escape
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Your number is not valid')
    .custom(async (value) => {
      try {
        const number = await User.findOne({ where: { wa: value } });
        if (number) {
          return Promise.reject('wa is also exist');
        }
      } catch (e) {
        console.log(e);
      }
    }),

  check('username').notEmpty().withMessage('username cannot empty')
    .custom(async (value) => {
      try {
        const username = await User.findOne({ where: { username: value } });
        if (username) {
          return Promise.reject('username is also exist');
        }
      } catch (e) {
        console.log(e);
      }
    }),
  check('password').notEmpty().withMessage('password cannot empty')
    .isLength({ min: 8 })
    .withMessage('password must be at last 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/)
    .withMessage('Password must be contain at least one uppercase, at least one lower case and  at least one special character'),
  check('cpassword').notEmpty().withMessage('confirm password cannot be empty')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirm does not match password');
      } else {
        return value;
      }
    }),
];
