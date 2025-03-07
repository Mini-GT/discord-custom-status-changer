import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { kMaxLength } from 'node:buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const textPath = path.join(__dirname, '../rockerPaperScissors.txt');
let messageData = await fs.readFile(textPath, 'utf8');

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

type ResultType = "rock" | "paper" | "scissors"

// type Status = "online" | "idle" | "dnd"

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
const score = {
  Me: 64,
  Ties: 67,
  Comp: 42
}
let line = messageData.split('\n');

const intervalId = setInterval(async () => {
  try {
    let sentence = line[index];

    if(sentence.includes("PICK")) {
      let playerMove: ResultType = pickMove()
      let computerMove: ResultType = pickMove()
      
      line[3] = `🧑: ${toPlayerEmoji(playerMove)}⠀⠀⠀⠀${toComputerEmoji(computerMove)} :🤖`
      line[line.length - 2] = result(playerMove, computerMove)
      line[line.length - 1] = `Me: ${score.Me} | Tie: ${score.Ties} | Comp: ${score.Comp}`

      // Write the file back
      await fs.writeFile(textPath, line.join('\n'));

      // Re-read the file to get updated content
      messageData = await fs.readFile(textPath, 'utf8');
      line = messageData.split('\n');
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
    // Await the update and handle potential errors
    await updateUserSettings(token, jsonData, url);

    // Cycle index
    index = (index + 1) % line.length;
  } catch (error) {
    // Stop the interval if there's an error
    console.error(error)
    console.log('An error occurred. Stopping interval.');
    clearInterval(intervalId);
  }
}, 4000);

function result(playerMove: ResultType, computerMove: ResultType) {
  let result = "";

  if (playerMove === "rock") {
    if (computerMove === "rock") {
      result = "🧑Tie🤖";
    } else if (computerMove === "paper") {
      result = "🤖 Computer Win!";
    } else if (computerMove === "scissors") {
      result = "🧑 I Win!";
    }
  } else if (playerMove === "paper") {
    if (computerMove === "rock") {
      result = "🧑 I Win!";
    } else if (computerMove === "paper") {
      result = "🧑Tie🤖";
    } else if (computerMove === "scissors") {
      result = "🤖 Computer Win!";
    }
  } else if (playerMove === "scissors") {
    if (computerMove === "rock") {
      result = "🤖 Computer Win!";
    } else if (computerMove === "paper") {
      result = "🧑 I Win!";
    } else if (computerMove === "scissors") {
      result = "🧑Tie🤖";
    }
  }

  if (result === "🧑 I Win!") {
    score.Me++;
  } else if (result === "🤖 Computer Win!") {
    score.Comp++;
  } else if (result === "🧑Tie🤖") {
    score.Ties++;
  }

  return result
}

function toPlayerEmoji(playerMove: ResultType): ResultType {
  let emoji;
  switch(playerMove) {
    case "rock":
      emoji = "🤜" as ResultType
      break
    case "paper":
      emoji = "✋" as ResultType
      break
    case "scissors":
      emoji = "✌️" as ResultType
      break
  }
  return emoji
}

function toComputerEmoji(computerMove: ResultType): ResultType {
  let emoji;
  switch(computerMove) {
    case "rock":
      emoji = "🤛" as ResultType
      break
    case "paper":
      emoji = "🤚" as ResultType
      break
    case "scissors":
      emoji = "✌️" as ResultType
      break
  }
  return emoji
}

function pickMove(): ResultType {
  const randomNum = Math.random();
  
  if (randomNum < 1/3) {
    return "rock";
  } else if (randomNum < 2/3) {
    return "paper";
  } else {
    return "scissors";
  }
}

// --------------------SHOOTING STATUS--------------------
// let index = 0
// let index2 = 0
// let kills = 811
// const profileStatus: Status[] = ["online", "idle", "dnd"]
// const emojiId = ["1346878004189462538", "1346878070644150312", "1346877945263816815"]
// const emojiNameArr = ["strongest", "weak", "high"]

// const intervalId = setInterval(async () => {
//   try {
//     const line = messageData.split('\n');
//     let sentence = line[index];
//     const profile = profileStatus[index2];
//     const emoji = emojiId[index]
//     const emojiName = emojiNameArr[index]

//     // Cycle index
//     index = (index + 1) % line.length;
//     index2 = (index2 + 1) % profileStatus.length;
    
//     if (sentence.includes("Kill(s):")) {
//       // For the last frame, include the kill count
//       sentence = `Kill(s): ${kills.toLocaleString()}`;
//     }

//     const jsonData = {
//       // "status": profile,
//       "custom_status": {
//         "text": sentence,
//         // "emoji_id": emoji,
//         // "emoji_name": emojiName
//       }
//     };
//     // console.log(jsonData)
//     if(sentence.includes("💀")) {
//       kills++
//       // Check if last line already has kill count format
//       const lastLine = line[line.length - 1];
//       if (lastLine.startsWith("Kill(s):")) {
//         // Replace the last line
//         line[line.length - 1] = `Kill(s): ${kills.toLocaleString()}`;
//       } else {
//         // Append a new line
//         line.push(`Kill(s): ${kills.toLocaleString()}`);
//       }
      
//       // Write the file back
//       await fs.writeFile(textPath, line.join('\n'));
//     }

//     // Await the update and handle potential errors
//     await updateUserSettings(token, jsonData, url);
//   } catch (error) {
//     // Stop the interval if there's an error
//     console.error(error)
//     console.log('An error occurred. Stopping interval.');
//     clearInterval(intervalId);
//   }
// }, 3500);

