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
    .update({twiml:`<Response><Say>Hello sashen your call has updated</Say></Response>`})

    // .update(`<Response><Dial><Client>5259c3d6-9861-4a9a-a82a-2a25a6210ddb</Client><Conference startConferenceOnEnter="true" endConferenceOnExit="true" beep="true">Sashen_${callSid}</Conference></Dial></Response>`)
    .then(call => {
      res.send(call);
    }).catch(error => res.send(error))
})

app.post('/participant/add', (req, res) => {
  client.conferences('CF12129ac85caea2ac99d23a8405f16790')
    .participants
    .create({
      label: 'Agent',
      earlyMedia: true,
      beep: 'onEnter',
      coaching: true,
      to:'+17372507574',
      from:'client:5259c3d6-9861-4a9a-a82a-2a25a6210ddb'
    })
    .then(participant => res.send(participant.callSid))
    .catch(e => res.send(e))


})

app.get('/conferences', async(req, res) =>{
 await axios({
    method: "get",
    url: "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Conferences.json",
    params: { status: "in-progress" },
    auth: {
      username: accountSid,
      password: authToken
    }
  })
  .then(function (response) {
    var conferenceSid = response.data.conferences[0].sid;
    console.log(response)
    res.send(response.data.conferences[0])
  })
      .catch(e => res.send(e))
})

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`)
})

