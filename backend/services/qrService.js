import QRCode from 'qrcode';
import QrCodeModel from '../models/QrCode.js';

export const generateQrImage = async (url, options = {}) => {
  try {
    const colorDark = options.color || '#000000';
    const colorLight = '#ffffff';

    // Generate Base64 Data URI PNG
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 500,
      color: {
        dark: colorDark,
        light: colorLight
      }
    });

    return dataUrl;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR Code image.');
  }
};

export const createQrForLink = async (link, user, options = {}) => {
  const imageUrl = await generateQrImage(link.shortUrl, options);

  const qrCode = await QrCodeModel.create({
    linkId: link._id,
    owner: user._id,
    imageUrl,
    color: options.color || '#000000',
    pattern: user.plan === 'core' ? options.pattern || null : null,
    cornerStyle: user.plan === 'core' ? options.cornerStyle || null : null,
    frame: user.plan === 'core' ? options.frame || null : null,
  });

  // Link the QrCode ID back to the link
  link.qrCodeId = qrCode._id;
  await link.save();

  return qrCode;
};

export default {
  generateQrImage,
  createQrForLink
};
