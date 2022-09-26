/* eslint-disable no-useless-escape */
/* eslint-disable no-multi-assign */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable prefer-promise-reject-errors */
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const multer = require('multer');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Boom } = require('@hapi/boom');
const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
} = require('@adiwajshing/baileys');
const { User, Message } = require('./src/models');

// Init express
const router = require('./src/routes/index.routes');
// use express json
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/', router);

app.use(cors());

const { phoneNumberFormatter, titleFormatter } = require('./src/helper/formatter');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png'
    || file.mimetype === 'image/jpg'
    || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTION');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const { state, saveState } = useSingleFileAuthState('./auth_info_1.json');
async function startBot() {
  const sock = makeWASocket({
    printQRInTerminal: false,
    auth: state,
  });
  sock.ev.on('connection.update', (update) => {
    console.log(update);
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      io.on('connection', (socket) => {
        socket.emit('message', 'Connecting..');
        qrcode.toDataURL(qr, (err, url) => {
          socket.emit('qr', url);
          socket.emit('message', 'QR Code received, scan please!');
        });
      });
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log(
        'connection closed due to ',
        lastDisconnect.error,
        ', reconnecting ',
        shouldReconnect,
      );
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
    }
  });
  sock.ev.on('creds.update', saveState);

  app.post('/api/register', [
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

  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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
    const pesan = `Verifikasi kode register ${body.otp}`;
    sock.sendMessage(number, { text: pesan });
  });
  app.post('/api/sendMessage', [
    check('title', 'title cannot empty').notEmpty(),
    check('caption').notEmpty().withMessage('caption cannot empty'),
    check('link').notEmpty().withMessage('link cannot empty'),
    check('wa').notEmpty().withMessage('wa cannot empty')
      .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      .withMessage('Your number is not valid'),

  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.file) {
      return res.status(422).json({
        success: 'Failed',
        message: 'Image cannot empty',
      });
    }
    const { body } = req;
    const images = req.file.path;
    body.image = images;
    const number = phoneNumberFormatter(body.wa);
    const titles = titleFormatter(body.title);

    try {
      const {
        title, caption, image, link,
      } = req.body;
      Message.create({
        title,
        caption,
        image,
        link,

      });
      res.status(200).json({
        message: 'Send Message success',
        data: req.body,
      });
    } catch (err) {
      return res.status(500).json({
        success: 'Failed',
        message: 'Database connection error',
      });
    }

    const templateButttons = [
      { index: 1, urlButton: { displayText: 'Klik', url: body.link } },

    ];

    const buttonMessage = {
      caption: titles,
      footer: body.caption,
      templateButtons: templateButttons,
      image: { url: images }, // it can be array { url: 'https://example.com/image.jpeg' } or buffer
      headerType: 4,
    };
    sock.sendMessage(number, buttonMessage);
    return res.status(201).json({
      message: 'Success',
      data: req.body,

    });
  });
}

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname,
  });
});

startBot();

server.listen(port, () => {
  console.log(`App running on : ${port}`);
});
