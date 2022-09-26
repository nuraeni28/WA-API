/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const login = async (req, res) => {
  try {
    const {
      username, password,
    } = req.body;
    if (!username || !password) {
      res.status(400).json({
        status: 'Failed',
        message: 'Username and Password cannot empty',
      });
    } else {
      const user = await User.findOne({
        where: { username: req.body.username },
      });
      if (!user) {
        res.status(400).json({
          status: 'Failed',
          message: 'Invalid username',
        });
      }
      const result = bcrypt.compareSync(req.body.password, user.password);
      if (result) {
        if (user.verified == 0) {
          res.status(400).json({
            status: 'Failed',
            message: 'Your account has not been activated',
          });
        }
        return res.status(200).json({
          status: 'Success',
          message: 'Login sukses',
        });
      }
      return res.status(400).json({
        status: 'Failed',
        message: 'Invalid password',

      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

module.exports = { login };
