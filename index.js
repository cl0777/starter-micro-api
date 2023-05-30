
const { RTMClient } = require("@slack/rtm-api");
const { WebClient } = require("@slack/web-api");
const { Configuration, OpenAIApi } = require("openai");
var http = require('http');
require('dotenv').config()
http.createServer(function (req, res) {
    console.log(`Just got a request at ${req.url}!`)
    


    res.write('Yo!');
    res.end();
}).listen(process.env.PORT || 3000);
console.log(process.env.SLACK_BOT_API)
// Initialize Slack API client
const slackClientRTM = new RTMClient(
  process.env.SLACK_BOT_API
);
const slackClientWEB = new WebClient(
  process.env.SLACK_BOT_API
);
console.log("Server Initiated")
// Function to send a message using the Slack API
async function sendMessage(channel, text) {
  try {
    await slackClientWEB.chat.postMessage({
      channel: channel,
      text: text,
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Function to send a message to the OpenAI ChatGPT API
async function sendChatMessage(message) {
  try {
    const config = new Configuration({
      apiKey: process.env.OPEN_AI_API,
    });

    const openai = new OpenAIApi(config);

    const runPrompt = async (message) => {
      const prompt = message;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 4000,
        temperature: 1,
      });

      const parsableJSONresponse = response.data.choices[0].text;

      return parsableJSONresponse;
    };

    return runPrompt(message);
  } catch (error) {
    console.error("Error sending chat message:", error);
  }
}

// Listen for message events
slackClientRTM.on("message", async (event) => {
  // Ignore bot messages and messages without text
  if (!event.bot_id && event.text) {
    // Get the prompt from the Slack message using ChatGPT API
    const prompt = event.text;

    // Send the prompt to ChatGPT API
    const response = await sendChatMessage(prompt);

    // Send the response back to the Slack channel
    sendMessage(event.channel, response);
  }
});

// Start the bot
async function startBot() {
  try {
    // Connect to Slack
    await slackClientRTM.start();

    console.log("Bot is running!");
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}

startBot();
