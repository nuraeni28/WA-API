/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { phoneNumberFormatter } = require('../helper/formatter');
const sendOTPService = require('../../waService');

const register = async (req, res) => {
  const sendOTP = await sendOTPService('sessionOTP');
  console.log(sendOTP);
  const { body } = req;
  const salt = bcrypt.genSaltSync(10);
  body.password = bcrypt.hashSync(body.password, salt);
  body.otp = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  const number = phoneNumberFormatter(body.wa);
  try {
    const {
      name, wa, username, password, otp,
    } = req.body;
    User.create({
      name,
      wa,
      username,
      password,
      otp,
    });
    res.status(200).json({
      message: 'Register success',
      data: req.body,
    });
  } catch (err) {
    return res.status(500).json({
      success: 'Failed',
      message: 'Database connection error',
    });
  }
};

module.exports = { register };
