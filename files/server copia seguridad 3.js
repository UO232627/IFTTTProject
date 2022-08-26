// server.js

// init project
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pkg = require('axios')
const { config } = require('dotenv')

const { MongoClient } = require('mongodb')
const uri = "mongodb+srv://aas:aas@events.c5dzfdz.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri)
const database = client.db("envira_ifttt")

const middleware = require('./middleware');
const helpers = require('./helpers');

const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY;

const { post } = pkg
config()

const app = express()

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

const addDocument = async (collection, id, doc) => {
  console.log(`Adding document ${id} to collection ${collection}`)
  //const database = client.db("envira_ifttt");
  const mongoCollection = database.collection(collection);
  await mongoCollection.insertOne(doc)
}

const updateTriggerIdentity = async (paramTriggerIdentity, updateProp) => {
  console.log(`Updating trigger identity ${paramTriggerIdentity}`)
  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')
  await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: updateProp })
}

const addEvent = async (paramTriggerIdentity, event) => {
  console.log(`Adding event ${event.meta.id} to triggerIdentity ${paramTriggerIdentity}`)
  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')
  const document = mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })

  document.then(result => {
    if (result !== null) {
      const data = result.events
      let eventsArr = []

      if (data != null) {
        console.log(`${paramTriggerIdentity}: events field already exists`)
        eventsArr = data
      }

      eventsArr.unshift(event)
      mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: { events: eventsArr } })
    }
    else {
      console.log('Document does nos exist for triggerIdentity ', paramTriggerIdentity)
    }
  })
}

const deleteTriggerIdentityField = async (paramTriggerIdentity, field) => { // Esto no se usa, lol
  console.log(`deleting field ${field} from triggerIdentity ${paramTriggerIdentity}`)

  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')
  const document = mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })

  if (document !== null) {
    const data = document.field
    let eventsArr = []
    if (data !== null) {
      await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: { field: "" } })
      console.log('Deleted field')
    }
    console.log(`Field ${field} does not exist for triggerIdentity ${paramTriggerIdentity} with data ${JSON.stringify(data)}`)
  }
  else {
    console.log('Document does not exist for triggerIdentity ', paramTriggerIdentity)
  }
}

const getTriggerIdentity = async (paramTriggerIdentity) => {
  console.log(`Get triggerIdentity ${paramTriggerIdentity}`)

  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')
  return await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
}

const deleteTriggerIdentity = async (paramTriggerIdentity) => {
  console.log(`Delete triggerIdentity ${paramTriggerIdentity}`)
  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')
  await mongoCollection.deleteOne({ triggerIdentity: paramTriggerIdentity })
}

const getEvents = async (paramTriggerIdentity, limit) => {
  console.log('Getting events array, limit is ', limit)
  if (limit <= 0) {
    return []
  }

  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')
  const document = await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
  if (document == null) {
    console.log(`Document for ${paramTriggerIdentity} does not exist, returning empty array`)
    return []
  }

  const data = document.events
  if (data == null) {
    console.log(`Events array is empty for triggerIdentity ${paramTriggerIdentity}`)
    return []
  }

  const events = data.slice(0, limit)
  console.log('Events size is ', events.length)
  return events
}

const addNewPetition = async (doc, paramTriggerIdentity) => {
  console.log(`Adding new trigger with triggerIdentity ${paramTriggerIdentity} to database`)

  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('nodered_petitions')

  const document = await mongoCollection.findOne({ uuid: doc.uuid, measure: doc.measure, triggerIdentity: paramTriggerIdentity, threshold: doc.threshold, 
                                           above_below: doc.above_below, ifttt_source: doc.ifttt_source, user: doc.user })

  if (document == null) {
    await mongoCollection.insertOne(doc) 
  }
}

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
  const document = await getTriggerIdentity(triggerIdentity)
  
  if (document == null) {
    const doc = {
      triggerIdentity: triggerIdentity,
      threshold: threshold,
      events: [getTestEvent() , getTestEvent(), getTestEvent()]
    }
    addDocument('triggerIdentities', triggerIdentity, doc)
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
    addNewPetition(docAux, triggerIdentity)
  }
  
  console.log(`trigger_identity: ${triggerIdentity}`)
  
  const measureLabel = req.body.triggerFields.measure
  console.log('Getting measures (' + measureLabel + ')')
  
  const aboveBelow = (req.body.triggerFields.above_below == '>') ? "above" : "below"
  
  //const measure = (req.body.temperature !== undefined) ? parseFloat(req.body.temperature) : ((aboveBelow == "above") ? 0 : 9999999999)
  const value = (req.body.value !== undefined) ? parseFloat(req.body.value) : -1
  console.log(value)
  
  if (value >= 0) {
    if (aboveBelow == "above") {
      if (value > threshold) {
        generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold)
      }
    }
    else {
      if (value < threshold) {
        generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold)
      }
    }
  }
  
  res.status(200).send({
    data: await getEvents(triggerIdentity, limit)
  })
});

const generateEvent = async (triggerIdentity, value, aboveBelow, measureLabel, threshold) => {
  console.log(measureLabel + ' is ' + aboveBelow + ' threshold')
  console.log('Generating trigger data')

  updateTriggerIdentity(triggerIdentity, { lastNotification: value })
  const event = {
    measure_value: value,
    measure_label: measureLabel,
    above_below: aboveBelow,
    threshold_value: threshold,
    created_at: (new Date()).toISOString(), // Must be a valid ISOString
    meta: {
      id: helpers.generateUniqueId(),
      timestamp: Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
    }
  }
  await addEvent(triggerIdentity, event)
}

const getTestEvent = () => {
  const event = {
    measure_value: 0,
    measure_label: "test",
    above_below: "test",
    threshold_value: 0,
    created_at: (new Date()).toISOString(), // Must be a valid ISOString
    meta: {
      id: helpers.generateUniqueId(),
      timestamp: Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
    }
  }
  return event
}

const enableRealtimeAPI = async () => {
  //const database = client.db('prueba_mongo')
  const mongoCollection = database.collection('triggerIdentities')

  const documents = await mongoCollection.find()
  const triggerIdentities = []
  documents.forEach(async (triggerIdDoc) => {
    // Es correcto triggerIdDoc._id o sería triggerIdDoc.triggerIdentity??
    //console.log(`${triggerIdDoc._id}: Checking if tempThreshold for Realtime API`)
    console.log(`${triggerIdDoc.triggerIdentity}: Checking if threshold for Realtime API`)
    const { threshold } = triggerIdDoc.threshold

    //triggerIdentities.push({ trigger_Identity: triggerIdDoc.id })
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
    .then((response) => {
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