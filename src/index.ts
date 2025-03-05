import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textPath = path.join(__dirname, '../gojoMessage.txt');
const messageData = await fs.readFile(textPath, 'utf8');

const url = "https://discord.com/api/v9/users/@me/settings"
const token = process.env.MINI_AUTH
if(!token) throw new Error('No token provided')

type SettingsDataType = {
  status: Status
  custom_status: {
    text: string
  }
}

type Status = "online" | "idle" | "dnd"

async function updateUserSettings(token: string, settingsData: SettingsDataType, url: string) {
  try {
    const response = await axios.patch(
      url, 
      settingsData, 
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // console.log('Update successful:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error updating settings:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

let index = 0
const profileStatus: Status[] = ["online", "idle", "dnd"]

const intervalId = setInterval(async () => {
  try {
    const line = messageData.split('\n');
    const sentence = line[index];
    const profile = profileStatus[index];
    
    // Cycle index
    index = (index + 1) % line.length;

    const jsonData = {
      "status": profile,
      "custom_status": {
        "text": sentence
      }
    };

    // Await the update and handle potential errors
    await updateUserSettings(token, jsonData, url);
  } catch (error) {
    // Stop the interval if there's an error
    console.log('An error occurred. Stopping interval.');
    clearInterval(intervalId);
  }
}, 5000);
