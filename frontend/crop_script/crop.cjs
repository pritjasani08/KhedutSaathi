const sharp = require('sharp');

sharp('../public/logo.png')
  .trim() // Automatically crops away transparent borders
  .toFile('../public/logo_trimmed.png')
  .then(info => {
    console.log('Trimmed successfully:', info);
  })
  .catch(err => {
    console.error('Error trimming:', err);
  });
