const { User } = require('../models');

const checkOTP = async (req, res) => {
  try {
    const {
      wa, otp,
    } = req.body;
    if (!wa || !otp) {
      res.status(400).json({
        status: 'Failed',
        message: 'WA and otp cannot empty',
      });
    } else {
      const user = await User.findOne({
        where: { wa: req.body.wa },
      });
      if (!user) {
        res.status(400).json({
          status: 'Failed',
          message: 'WA not found',
        });
      } else {
        if (user.expiredAt < Date.now()) {
          res.status(400).json({
            status: 'Failed',
            message: 'Your OTP has expired',
          });
        }
        // eslint-disable-next-line eqeqeq
        if (user.otp != req.body.otp) {
          res.status(400).json({
            status: 'Failed',
            message: 'Invalid OTP',
          });
        } else {
          await User.update({ verified: true }, {
            where: { otp: req.body.otp },
          });
          res.status(200).json({
            status: 'Success',
            message: 'Your registration successfully',
          });
        }
        // eslint-disable-next-line no-underscore-dangle
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
};

module.exports = { checkOTP };
