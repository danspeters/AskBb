var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: null,
    appPassword: null
//    appId: process.env.MicrosoftAppId,
//    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
//server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
//var bot = new builder.UniversalBot(connector, function (session) {
//    session.send("You said: %s", session.message.text);
//});

var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());         // Register in-memory state storage
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

//Ask Bb KnowledgeBaseID and Authkey for the relevant Ask Bb KB on www.qnamaker.ai 
var recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: '70647a58-8b5b-4309-a8f3-9776602c0b97',
    authKey: 'bc3f7b4a-7da8-4a4b-bb59-4635c6c4ef91'
});

//The QnA Maker tools needs to be initialized and added to the bot.libraries. 
//If this is not registered, the QnA dialog is unaware of the feedback dialog 
//and it will behave as the simple QnA bot returning one response.
var qnaMakerTools = new cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3,
    feedbackLib: qnaMakerTools
});

bot.dialog('/', basicQnAMakerDialog);