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
export async function checkFileInServer(hashId) {
  try {
    const result = await cloudinary.v2.search
      .expression(`folder:audio_dojo AND filename:${hashId}`)
      .execute();

    if (result.resources.length > 0) {
      return result.resources[0].secure_url;
    }
  } catch (error) {
    console.error("Error checking file in Cloudinary:", error);
  }

  return null;
}

// Load AudioBuffer using fs (Node.js)
export async function loadAudioBufferNode(audioContext, filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const arrayBuffer = fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength);
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error("Error loading audio file:", error);
    throw error;
  }
}

// Load AudioBuffer from a relative file path under /public (Browser)
export async function loadAudioBufferBrowser(audioContext, filePath) {
  try {
    const res = await fetch(`/${filePath}`);
    if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error('Error loading audio buffer:', err);
    throw err;
  }
}

/**
 * Load an AudioBuffer via fetch from /public.
 * @param {AudioContext} audioContext
 * @param {string} filePath  // e.g. "sounds/original/male vocal1.wav"
 */
export async function loadAudioBuffer(audioContext, filePath) {
  const res = await fetch(`/${filePath}`);
  if (!res.ok) throw new Error(`Failed to fetch ${filePath}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}

// Upload file to Cloudinary
export async function uploadFileToServer(hashId, blob) {
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
        return result.secure_url;
      }
    );

    readableStream.pipe(uploadStream);
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return null;
  }
}

/**
 * Encode an AudioBuffer back into a WAV-format Blob.
 * @param {AudioBuffer} audioBuffer
 * @returns {Promise<Blob>}
 */
export async function bufferToBlob(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const audioData = {
    sampleRate,
    channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, ch) =>
      audioBuffer.getChannelData(ch)
    )
  };
  const wavBuffer = await WavEncoder.encode(audioData);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}
