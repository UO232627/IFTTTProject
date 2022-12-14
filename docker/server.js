// Initialize project
import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'axios';
import { config } from 'dotenv';

import * as middleware from './middleware.js';
import * as helpers from './helpers.js';
import * as mongodb from './mongodb.js';

const { post } = pkg
config()

const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY;

const app = express()
app.use(bodyParser.json());

// IFTTT endpoint to check the status of the API
app.get('/ifttt/v1/status', middleware.serviceKeyCheck, (req, res) => {
  res.status(200).send();
});

// IFTTT endopint to test and setup the API
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

// Endpoint for IFTTT trigger called measure
app.post('/ifttt/v1/triggers/measure', async (req, res) => {
  // Gets key from request headers
  const key = req.get("IFTTT-Service-Key");
  
  // Check if the key is valid
  if (key !== IFTTT_SERVICE_KEY) {
    res.status(401).send({
      "errors": [{
        "message": "Channel/Service key is not correct"
      }]
    });
  }
  
  // Check if triggerIdentity in request body is missing
  const triggerIdentity = req.body.trigger_identity
  if (triggerIdentity === null) {
    return res.status(400).send({
      errors: [{
        message: 'trigger_identity field was missing for request'
      }]
    })
  }
  
  // Check if triggerFields in request body is missing
  const { triggerFields } = req.body
  if (triggerFields === undefined) {
    return res.status(400).send({
      errors: [{
        message: 'triggerFields object was missing from request'
      }]
    })
  }
  
  // Check if any field in triggerFields is missing
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
  
  // Get threshold value
  const threshold = parseFloat(req.body.triggerFields.threshold)
  // Get limit value. If not provided in request body, set limit = 50 (default)
  const limit = (req.body.limit !== undefined) ? req.body.limit : 50
  // Get the document with the triggerIdentity in the request body
  const document = await mongodb.getTriggerIdentity(triggerIdentity)
  
  // Check if the document exists. If not, create a new one and add it to database
  if (document == null) {
    const doc = {
      triggerIdentity: triggerIdentity,
      threshold: threshold,
      events: [helpers.getTestEvent() , helpers.getTestEvent(), helpers.getTestEvent()]
    }
    await mongodb.addDocument('triggerIdentities', triggerIdentity, doc) // await??
  }
  
  // Check if the petition is an IFTTT one or a Node-RED one. If its an initial one, creates a new
  // object with all necesary fields to make a petition and adds it to the database
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
    await mongodb.addNewPetition(docAux, triggerIdentity) // await??
  }
  
  console.log(`trigger_identity: ${triggerIdentity}`)
  
  // Get the selected label measure
  const measureLabel = req.body.triggerFields.measure
  console.log('Getting measures (' + measureLabel + ')')
  
  // Puede cambiarse para que la propia petici??n ya traiga above/below y no haga falta este paso,
  // as?? se puede sacar directamente del body de la petici??n
  // Transform the above_below in request body into "above" or "below"
  const aboveBelow = (req.body.triggerFields.above_below == '>') ? "above" : "below"
  
  // Get the value of the measure. If is an IFTTT petition, set the value at -1
  const value = (req.body.value !== undefined) ? parseFloat(req.body.value) : -1
  console.log(value)
  
  // If is not an IFTTT petition
  if (value >= 0) {
    // Check if above_below is "above"
    if (aboveBelow == "above") {
      // Check if value is above threshold
      if (value > threshold) {
        helpers.generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold)
      }
    }
    else {
      // Check if value is below threshold
      if (value < threshold) {
        helpers.generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold)
      }
    }
  }
  
  res.status(200).send({
    data: await mongodb.getEvents(triggerIdentity, limit)
  })
});

// Send a petition to Realtime API for each triggerIdentity in the database
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
    .then((response) => { // No est?? entrando aqu?? no se por qu??, aunque funciona bien, es solo una notificaci??n
      console.log(`Notified IFTTT to poll ${triggerIdentities.length} triggerIdentities`)
    })
    .catch((error) => {
      console.error(error)
    })
  }
}

// listen for requests
app.get('/', (req, res) => {
  res.render('index.ejs');
});

/*const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});*/

const listener = app.listen(3000, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Repeat enableRealtimeAPI each 60 seconds (configurable)
setInterval(enableRealtimeAPI, 60000)