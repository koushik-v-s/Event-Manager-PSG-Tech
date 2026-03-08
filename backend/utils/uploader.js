const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const streamUpload = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: publicId,
        folder: 'psgct-events',
        overwrite: true,
        format: 'pdf' // 👈 explicitly set pdf format
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const uploadToCloudinary = async (file, ivId, fileType) => {
  try {
    if (!file?.buffer || !file?.mimetype || !file?.originalname) {
      throw new Error('Invalid file input: missing buffer, mimetype, or originalname.');
    }

    const timestamp = Date.now();
    const publicId = `${ivId}/${fileType}_${timestamp}`; // 👈 removed `.pdf` here

    const result = await streamUpload(file.buffer, publicId);
    return result.secure_url; // 👈 this should now directly open in browser
  } catch (error) {
    throw new Error('Failed to upload to Cloudinary.');
  }
};

module.exports = { uploadToCloudinary };
