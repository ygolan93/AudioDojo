// audioAPI.js - Server Communication and Audio Generation for Node.js
import WavEncoder from 'wav-encoder';
import { AudioContext } from 'node-web-audio-api';
import cloudinary from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = "audio_dojo";

// Check if file exists in Cloudinary
async function checkFileInServer(hashId) {
  console.log(`Checking file in Cloudinary with hashId: ${hashId}`);

  try {
    const result = await cloudinary.v2.search
      .expression(`folder:audio_dojo AND filename:${hashId}`)
      .execute();

    if (result.resources.length > 0) {
      const fileUrl = result.resources[0].secure_url;
      console.log("File found in Cloudinary:", fileUrl);
      return fileUrl;
    } else {
      console.log(`File not found in Cloudinary: ${hashId}`);
    }
  } catch (error) {
    console.error("Error checking file in Cloudinary:", error);
  }

  return null;
}



// Upload file to Cloudinary
async function uploadFileToServer(hashId, blob) {
  console.log(`Uploading file to Cloudinary with hashId: ${hashId}`);

  try {
    const buffer = await blob.arrayBuffer(); // המרת ה-Blob ל-Buffer
    const readableStream = Readable.from(Buffer.from(buffer));

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "raw", public_id: `audio_dojo/${hashId}` },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return null;
        }
        console.log("File uploaded to Cloudinary:", result.secure_url);
        return result.secure_url;
      }
    );

    readableStream.pipe(uploadStream);

  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return null;
  }
}



async function generateAudioFile(params) {
  console.log('Generating audio file with parameters:', params);

  const sampleRate = 44100;
  const duration = 1;
  const frequency = 400;
  const amplitude = 0.5;

  const samples = new Float32Array(sampleRate * duration);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = amplitude * Math.sin(2 * Math.PI * frequency * (i / sampleRate));
  }

  const audioData = {
    sampleRate,
    channelData: [samples],
  };

  const wavBuffer = await WavEncoder.encode(audioData);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

export { checkFileInServer, uploadFileToServer, generateAudioFile };
