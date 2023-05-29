const socketIO = require('socket.io')
const tmi = require("tmi.js")
const axios = require('axios')
const readline = require('readline')
require('dotenv').config();
const io = socketIO(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const twitchClient = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_PASSWORD,
  },
  channels: [process.env.TWITCH_CHANNEL]
});

const validBotCommands = ["!dance", "!fight"]
twitchClient.connect();

twitchClient.on('message', (channel, tags, message, self) => {
    if (self) return;
    if (validBotCommands.includes(message)) {
        io.sockets.emit("botCommand", message.slice(1))
        return
    }
    axios.get(
            `http://127.0.0.1:5000/insulaQuery?chatMessage=${message}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )
        .then(response => response.data)
        .then(text => {
            io.sockets.emit("twitchMessage", text)
        }).catch(error => {
            console.error(error)
        });
});


// Testing functionality without twitch chat
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question('Please enter a message: ', (message) => {
//   if (validBotCommands.includes(message)) {
//     io.sockets.emit("botCommand", message.slice(1))
//     return
//   }
//   axios.get(
//       `http://127.0.0.1:5000/insulaQuery?chatMessage=${message}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       }
//     )
//     .then(response => response.data)
//     .then(text => {
//       console.log("text:", text)
//       io.sockets.emit("twitchMessage", text)
//     }).catch(error => {
//       console.error(error)
//     });
//   rl.close();
// });
