var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('../../../lib/botbuilder-cognitiveservices');
var customQnAMakerTools = require('./CustomQnAMakerTools');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());         // Register in-memory state storage
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: 'set your kbid here',
    authKey: 'set your authorization key here',
    top: 4});

var customQnAMakerTools = new customQnAMakerTools.CustomQnAMakerTools();
bot.library(customQnAMakerTools.createLibrary());

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3,
    feedbackLib: customQnAMakerTools
});

bot.dialog('/', basicQnAMakerDialog);