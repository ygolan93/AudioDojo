// audioAPI.js - Server Communication and Audio Generation for Node.js
import WavEncoder from 'wav-encoder';
import { AudioContext } from 'node-web-audio-api';
import cloudinary from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: '../.env' });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = "audio_dojo";
const AUDIO_PATH = path.join(process.cwd(), 'public/sounds/original/drumset');

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
    const buffer = await blob.arrayBuffer();
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

async function loadAudioBuffer(audioContext, filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const arrayBuffer = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength);
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error("Error loading audio file:", error);
    throw error;
  }
}

async function bufferToBlob(audioBuffer, sampleRate) {
  const audioData = {
    sampleRate,
    channelData: [audioBuffer.getChannelData(0)],
  };

  const wavBuffer = await WavEncoder.encode(audioData);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

async function generateAudioFile(params) {
  const { instrument } = params;
  const fileName = instrument === 'Kick' ? 'kick/kick1.wav' : 'snare/snare1.wav';
  const filePath = path.join(AUDIO_PATH, fileName);

  console.log(`Processing audio file: ${filePath}`);

  try {
    const audioContext = new AudioContext();
    const audioBuffer = await loadAudioBuffer(audioContext, filePath);
    const processedBlob = await bufferToBlob(audioBuffer, audioContext.sampleRate);

    console.log("Audio processing complete");
    return processedBlob;

  } catch (error) {
    console.error("Error processing audio file:", error);
    return null;
  }
}

export { checkFileInServer, uploadFileToServer, generateAudioFile };
