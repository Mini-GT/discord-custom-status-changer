import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textPath = path.join(__dirname, '../shoot.txt');
const messageData = await fs.readFile(textPath, 'utf8');

const url = "https://discord.com/api/v9/users/@me/settings"
const token = process.env.MINI_AUTH
if(!token) throw new Error('No token provided')

type SettingsDataType = {
  // status: Status
  custom_status: {
    text: string
    // emoji_id: string,
    // emoji_name: string
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
    
    // console.log('Update successful:', response);
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
let index2 = 0
let kills = 811
const profileStatus: Status[] = ["online", "idle", "dnd"]
const emojiId = ["1346878004189462538", "1346878070644150312", "1346877945263816815"]
const emojiNameArr = ["strongest", "weak", "high"]

const intervalId = setInterval(async () => {
  try {
    const line = messageData.split('\n');
    let sentence = line[index];
    const profile = profileStatus[index2];
    const emoji = emojiId[index]
    const emojiName = emojiNameArr[index]

    // Cycle index
    index = (index + 1) % line.length;
    index2 = (index2 + 1) % profileStatus.length;
    
    if (sentence.includes("Kill(s):")) {
      // For the last frame, include the kill count
      sentence = `Kill(s): ${kills.toLocaleString()}`;
    }

    const jsonData = {
      // "status": profile,
      "custom_status": {
        "text": sentence,
        // "emoji_id": emoji,
        // "emoji_name": emojiName
      }
    };
    // console.log(jsonData)
    if(sentence.includes("💀")) {
      kills++
      // Check if last line already has kill count format
      const lastLine = line[line.length - 1];
      if (lastLine.startsWith("Kill(s):")) {
        // Replace the last line
        line[line.length - 1] = `Kill(s): ${kills.toLocaleString()}`;
      } else {
        // Append a new line
        line.push(`Kill(s): ${kills.toLocaleString()}`);
      }
      
      // Write the file back
      await fs.writeFile(textPath, line.join('\n'));
    }

    // Await the update and handle potential errors
    await updateUserSettings(token, jsonData, url);
  } catch (error) {
    // Stop the interval if there's an error
    console.error(error)
    console.log('An error occurred. Stopping interval.');
    clearInterval(intervalId);
  }
}, 3500);

