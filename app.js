const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

// Facebook Messenger Api Tokens
const VERIFY_TOKEN = 'webdev123'
const PAGE_ACCESS_TOKEN = 'EAADS9KO4m94BAHmIAMWFEDq8Lypa9Qi0ITFNqO12c4hOtWGs8lazKwYgJETqFUZBbVunEPdZAN7uTxSZAgs3mdUnPQzOdSxcaiZBp8ZB27smmOmJhxIzFVIaSnu9AFh5oBn7WJrT2Pz20q2PJrpEdMXCnoIiTVRxv7C6aadrE2gZDZD'


app.set('port', (process.env.PORT || 4000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});


// for Facebook Post Message
app.post('/webhook/', function (req, res) {
    var data = req.body;
    console.log('New Message');
    // Make sure this is a page subscription
    if (data.object == 'page') {
      // Iterate over each entry
      // There may be multiple if batched
      data.entry.forEach(function(pageEntry) {
        var pageID = pageEntry.id;
        var timeOfEvent = pageEntry.time;

        // Iterate over each messaging event
        pageEntry.messaging.forEach(function(messagingEvent) {
          if (messagingEvent.message) {
            // Echoes the received message
            const userId = messagingEvent.sender.id;
            const text = messagingEvent.message.text;
            console.log(userId, text);
            sendMessage(userId, text)

          } else {
            console.log('Undefined Message Type', messagingEvent)
          }
        });
    });

    res.sendStatus(200);

  }
})


function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: {
        text: message
      },
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

module.exports = app;