// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pkg = require('axios')
const { config } = require('dotenv')

const middleware = require('./middleware');
const helpers = require('./helpers');
const mongodb = require('./mongodb')

const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY;

const { post } = pkg
config()

const app = express()

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// The status
app.get('/ifttt/v1/status', middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send();
});

// The test/setup endpoint
app.post('/ifttt/v1/test/setup', middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send({
    "data": {
      samples: {
        "triggers": {
          "measure": {
            uuid: 'test',
            measure: 'test',
            threshold: '20',
            above_below: '<'
          }
        }
      }
    }
  });
});

// Trigger measure
app.post('/ifttt/v1/triggers/measure', async (req, res) => {
  const key = req.get("IFTTT-Service-Key");
  
  if (key !== IFTTT_SERVICE_KEY) {
    res.status(401).send({
      "errors": [{
        "message": "Channel/Service key is not correct"
      }]
    });
  }
  
  const triggerIdentity = req.body.trigger_identity
  if (triggerIdentity === null) {
    return res.status(400).send({
      errors: [{
        message: 'trigger_identity field was missing for request'
      }]
    })
  }
  
  const { triggerFields } = req.body
  if (triggerFields === undefined) {
    return res.status(400).send({
      errors: [{
        message: 'triggerFields object was missing from request'
      }]
    })
  }
  
  if (!Object.prototype.hasOwnProperty.call(triggerFields, 'threshold')
     || !Object.prototype.hasOwnProperty.call(triggerFields, 'measure')
     || !Object.prototype.hasOwnProperty.call(triggerFields, 'uuid')
     || !Object.prototype.hasOwnProperty.call(triggerFields, 'above_below')) {
    console.error('Request was missing fields')
    
    return res.status(400).send({
      errors: [{
        message: 'One or more triggerFields were missing from request'
      }]
    })
  }
  
  const threshold = parseFloat(req.body.triggerFields.threshold)
  
  const limit = (req.body.limit !== undefined) ? req.body.limit : 50
  const document = await mongodb.getTriggerIdentity(triggerIdentity)
  
  if (document == null) {
    const doc = {
      triggerIdentity: triggerIdentity,
      threshold: threshold,
      events: [helpers.getTestEvent() , helpers.getTestEvent(), helpers.getTestEvent()]
    }
    mongodb.addDocument('triggerIdentities', triggerIdentity, doc) // await??
  }
  
  if (req.body.initial === undefined) {
    const docAux = {
      uuid: req.body.triggerFields.uuid,
      measure: req.body.triggerFields.measure,
      triggerIdentity: triggerIdentity,
      threshold: threshold,
      above_below: req.body.triggerFields.above_below,
      ifttt_source: req.body.ifttt_source,
      user: req.body.user
    }
    mongodb.addNewPetition(docAux, triggerIdentity) // await??
  }
  
  console.log(`trigger_identity: ${triggerIdentity}`)
  
  const measureLabel = req.body.triggerFields.measure
  console.log('Getting measures (' + measureLabel + ')')
  
  // Puede cambiarse para que la propia petición ya traiga above/below y no haga falta este paso,
  // así se puede sacar directamente del body de la petición
  const aboveBelow = (req.body.triggerFields.above_below == '>') ? "above" : "below"
  
  const value = (req.body.value !== undefined) ? parseFloat(req.body.value) : -1
  console.log(value)
  
  if (value >= 0) {
    if (aboveBelow == "above") {
      if (value > threshold) {
        helpers.generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold)
      }
    }
    else {
      if (value < threshold) {
        helpers.generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold)
      }
    }
  }
  
  res.status(200).send({
    data: await mongodb.getEvents(triggerIdentity, limit)
  })
});

const enableRealtimeAPI = async () => {  
  const documents = await mongodb.getRealtimeAPIDocuments()  
  const triggerIdentities = []
  
  documents.forEach(async (triggerIdDoc) => {
    console.log(`${triggerIdDoc.triggerIdentity}: Checking if are some threshold events for Realtime API`)
    triggerIdentities.push({ trigger_Identity: triggerIdDoc.triggerIdentity })
  })

  if (triggerIdentities.length > 0) {
    post('http://realtime.ifttt.com/v1/notifications', 
      {
        data: triggerIdentities
      },
      {
        headers: {
          'Content-type': 'application/json',
          'IFTTT-Service-Key': IFTTT_SERVICE_KEY
        }
      }
    )
    .then((response) => { // No está entrando aquí no se por qué, aunque funciona bien, es solo una notificación
      console.log(`Notified IFTTT to poll ${triggerIdentities.length} triggerIdentities`)
    })
    .catch((error) => {
      console.error(error)
    })
  }
}

// listen for requests :)
app.get('/', (req, res) => {
  res.render('index.ejs');
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

setInterval(enableRealtimeAPI, 60000)