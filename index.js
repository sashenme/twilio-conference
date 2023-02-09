const express = require('express')
require('dotenv').config()
const path = require('path');
const axios = require('axios');

const app = express()
const PORT = 8000

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));

})

app.get('/list', (req, res) => {
  client.calls.list({ limit: 5, status: 'in-progress', })
    .then(calls => {
      res.send(calls)
    })
})

app.post('/list/:id/update', (req, res) => {
  const callSid = req.params.id
  client.calls(callSid)
    // .update({ twiml: `<Response><Dial callerId= "+46764471792" answerOnBridge="true" action="/test" method="POST" timeout="30"><Client>5259c3d6-9861-4a9a-a82a-2a25a6210ddb</Client><Conference startConferenceOnEnter="true" endConferenceOnExit="true" beep="false">call_${callSid}</Conference></Dial></Response>` })
    // .update({twiml:`<Response><Say>Hello sashen your call has updated</Say></Response>`})

    .update({ twiml: `<Response><Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="true" beep="false" eventCallbackUrl="/conference" method="POST">conference-${callSid}</Conference></Dial></Response>` })
    .then(call => {
      res.send(call);
    }).catch(error => res.send(error))
})

app.post('/participant/add', (req, res) => {
  client.conferences('CF0645abdcb877d596e48c375334a3159d')
    .participants
    .create({
      from: '+17372507574',
      // from:'client:5259c3d6-9861-4a9a-a82a-2a25a6210ddb',
      // to: 'client:5259c3d6-9861-4a9a-a82a-2a25a6210ddb', //Admin Navigate
      to: 'client:5e4611d6-c68c-4884-8ec1-33104e17cf23', //Sashen Pasindu
      earlyMedia: 'true',
      // muted: 'true',
      // coaching: 'true'
    })
    .then(participant => res.send(participant.callSid))
    .catch(e => res.send(e))
})

app.post('/join/:conferenceId/:clientId', (req, res) => {
  const conferenceId = req.params.conferenceId
  const clientId = req.params.clientId
  client.conferences(conferenceId)
    .participants
    .create({
      from: '+17372507574',
      to: `client:${clientId}`,
      earlyMedia: 'true',
      muted: 'true',
      // coaching: 'true'
    })
    .then(participant => res.send(participant.callSid))
    .catch(e => res.send(e))
})

app.get('/conferences', async (req, res) => {
  await axios({
    method: "get",
    url: "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Conferences.json",
    params: { friendly_name: "letItGoSimple" },
    auth: {
      username: accountSid,
      password: authToken
    }
  })
    .then(function (response) {
      var conferenceSid = response.data.conferences[0].sid;
      console.log(response)
      res.send(response.data.conferences)
    })
    .catch(e => res.send(e))
})

app.get('/conferences/live', async (req, res) => {
  await client.conferences.list({ limit: 5, status: 'in-progress', })
    .then(conferences => {
      res.send(conferences)
    })
})

app.post('/updateCall/:callId', (req, res) => {
  const callId = req.params.callId;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callId}`;

  axios({
    method: "post",
    url: url,
    auth: {
      username: accountSid,
      password: authToken
    },
    data: {
      Url: "http://www.mocky.io/v2/584ac0f81000002b14fb0205",
      Method: "GET"
    }
  })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      console.log(error);
    });
})

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`)
})

