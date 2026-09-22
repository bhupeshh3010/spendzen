const QRCode = require('qrcode');
const path = require('path');

const url = 'https://detection-prozac-informal-empire.trycloudflare.com';
const publicPath = path.join(__dirname, 'public', 'app-qr.png');
const brainPath = 'C:\\Users\\BHUPESH\\.gemini\\antigravity\\brain\\5d618a70-7f99-46df-ab46-08feeeefc031\\app_qr_code.png';

async function generate() {
  const options = {
    errorCorrectionLevel: 'H',
    type: 'png',
    quality: 0.95,
    margin: 2,
    color: {
      dark: '#312e81', // Indigo 900
      light: '#ffffff'
    },
    width: 500
  };

  await QRCode.toFile(publicPath, url, options);
  console.log('Saved to public:', publicPath);

  await QRCode.toFile(brainPath, url, options);
  console.log('Saved to brain:', brainPath);
}

generate().catch(console.error);
