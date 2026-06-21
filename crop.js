import sharp from 'sharp';

async function cropImage() {
  try {
    console.log('Cropping logo...');
    await sharp('public/logo.png')
      .trim({ threshold: 20 }) 
      .toFile('public/logo-cropped.png');
    console.log('Cropped successfully!');
  } catch (err) {
    console.error('Error cropping image', err);
  }
}

cropImage();
