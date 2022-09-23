// eslint-disable-next-line func-names
const phoneNumberFormatter = function (number) {
  // remove characters other than numbers
  // eslint-disable-next-line no-useless-escape
  let formatted = number.replace('/\D/g', '');

  // remove number 0
  if (formatted.startsWith('0')) {
    formatted = `62${formatted.substr(1)}`;
  }
  if (!formatted.endsWith('@s.whatsapp.net')) {
    formatted += '@s.whatsapp.net';
  }
  return formatted;
};
// eslint-disable-next-line func-names
const titleFormatter = function (title) {
  // eslint-disable-next-line no-undef
  formatted = `*${title}*`;
  // eslint-disable-next-line no-undef
  return formatted;
};
module.exports = {
  phoneNumberFormatter, titleFormatter,
};
