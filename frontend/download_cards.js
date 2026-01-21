const https = require('https');
const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, 'public', 'cards');

if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true });
}

const suits = ['S', 'D', 'C', 'H'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function downloadCards() {
  console.log('Descargando cartas...\n');
  
  try {
    await downloadFile(
      'https://deckofcardsapi.com/static/img/back.png',
      path.join(cardsDir, 'back.png')
    );
  console.log('OK back.png');
    
    for (const suit of suits) {
      for (const value of values) {
        const code = `${value}${suit}`;
        await downloadFile(
          `https://deckofcardsapi.com/static/img/${code}.png`,
          path.join(cardsDir, `${code}.png`)
        );
  console.log(`OK ${code}.png`);
      }
    }
    
    console.log('\nOK ¡53 cartas descargadas!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadCards();
