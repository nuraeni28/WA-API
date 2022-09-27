/* eslint-disable arrow-parens */
/* eslint-disable block-spacing */
/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */
/* eslint-disable default-param-last */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
/* eslint-disable no-plusplus */
/* eslint-disable no-useless-concat */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
const { Boom } = require('@hapi/boom');
const {
  default:
    makeWASocket,
  AnyMessageContent,
  delay,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  MessageRetryMap,
  useMultiFileAuthState,
  downloadMediaMessage,
} = require('@adiwajshing/baileys');
const fs = require('fs');
const { writeFile } = require('fs/promises');
const path = require('path');
const qrTerm = require('qrcode-terminal');

// const direktoriUtama = "./service/wablast/sesions/";
const direktoriUtama = './session/';
let messageCallback;

async function startSocket(dirSesion = String, Callback) {
  const SocketWA = [];

  const { state, saveCreds } = await useMultiFileAuthState(direktoriUtama + dirSesion);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
  });

  sock.ev.on('connection.update', (connection) => {
    if (connection.connection == 'close') {
      startSocket(dirSesion, Callback);
    } else if (connection.connection == 'open') {
      Object.assign(SocketWA, {
        id: sock.user.id,
        name: sock.user.name,
      });
      // buat nambah object baru ke variabel
      Object.assign(SocketWA, {
        sendOTP: (id, otp) => {
          sock.sendMessage(id, {
            text: `Verifikasi kode register ${otp}`,
          });
        },

      });
      if (Callback) {
        Callback(SocketWA);
      }
    } else if (connection.qr) {
      qrTerm.generate(connection.qr, { small: true });
    }
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
  });

  return SocketWA;
}

module.exports = startSocket;
