// server.js

// TODO - Comprobar que se pueden quitar los try - finally intentando acceder al server desde
// dos instancias distintas

// init project
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pkg = require('axios')
const { config } = require('dotenv')

const { MongoClient } = require('mongodb')
const uri = "mongodb+srv://aas:aas@events.c5dzfdz.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri)

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
  try {
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection(collection)
    await mongoCollection.insertOne(doc)
  } finally {
    //await client.close()
  }
}

const updateTriggerIdentity = async (paramTriggerIdentity, updateProp) => {
  try {
    console.log(`Updating trigger identity ${paramTriggerIdentity}`)
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: updateProp })
  } finally {
    //await client.close()
  }
}

const addEvent = async (paramTriggerIdentity, event) => {
  try {
    console.log(`Adding event ${event.meta.id} to triggerIdentity ${paramTriggerIdentity}`)
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    const document = mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
    
    document.then(result => {
      if (result !== null) {
        const data = result.events
        let eventsArr = []

        //if (Object.prototype.hasOwnProperty.call(data, 'events')) {
        if (data != null) {
          console.log(`${paramTriggerIdentity}: events field already exists`)
          eventsArr = data
        }
        eventsArr.unshift(event)
        if (eventsArr.length > 50) {
          eventsArr.pop()
        }
        mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: { events: eventsArr } })
      }
      else {
        console.log('Document does nos exist for triggerIdentity ', paramTriggerIdentity)
      }
    })
  } finally {
    //await client.close()
  }
}

const deleteTriggerIdentityField = async (paramTriggerIdentity, field) => { // Esto no se usa, lol
  try {
    console.log(`deleting field ${field} from triggerIdentity ${paramTriggerIdentity}`)
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    const document = mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
    
    if (document !== null) {
      const data = document.field
      let eventsArr = []
      if (data !== null) {
        await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: { field: "" } }) // Mñe, no me convence, creo que estámal
        console.log('Deleted field')
      }
      console.log(`Field ${field} does not exist for triggerIdentity ${paramTriggerIdentity} with data ${JSON.stringify(data)}`)
    }
    else {
      console.log('Document does not exist for triggerIdentity ', paramTriggerIdentity)
    }
  } finally {
    //await client.close()
  }
}

const getTriggerIdentity = async (paramTriggerIdentity) => {
  try {
    console.log(`Get triggerIdentity ${paramTriggerIdentity}`)
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    return await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
  } finally {
    //await client.close()
  }
}

const deleteTriggerIdentity = async (paramTriggerIdentity) => {
  try {
    console.log(`Delete triggerIdentity ${paramTriggerIdentity}`)
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    await mongoCollection.deleteOne({ triggerIdentity: paramTriggerIdentity })
  } finally {
    //await client.close()
  }
}

const getEvents = async (paramTriggerIdentity, limit) => {
  try {
    console.log('Getting events array, limit is ', limit)
    if (limit <= 0) {
      return []
    }
    
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    const document = await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
    if (document == null) {
      console.log(`Document for ${paramTriggerIdentity} does not exist, returning empty array`)
      return []
    }
    
    const data = document.events
    //if (!Object.prototype.hasOwnProperty.call(data, 'events')) {
    if (data == null) {
      console.log(`Events array is empty for triggerIdentity ${paramTriggerIdentity}`)
      return []
    }
    
    //const events = data.event.slice(0, limit)
    const events = data.slice(0, limit)
    console.log('Events size is ', events.length)
    return events
  } finally {
    //await client.close()
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
          "temp_above": {
            temp_threshold: '30' 
          }
        }
      }
    }
  });
});

// Trigger endpoints
app.post('/ifttt/v1/triggers/temp_above', async (req, res) => {
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
  
  if (!Object.prototype.hasOwnProperty.call(triggerFields, 'temp_threshold')) {
  //if (triggerFields.temp_threshold === undefined) {
    console.error('Request was missing fields')
    return res.status(400).send({
      errors: [{
        message: 'One or more triggerFields were missing from request'
      }]
    })
  }
  
  // TODO Comprobar si es petición inicial/poll o una de Node-RED. Si no es de Node-RED,
  // hacer una petición http a Node-RED que guarde en variables globales la medida que se
  // quiere tomar, etc. (p. ej. temp). En Node-RED habría que hacer que cuando se publica
  // una medida, envíe en la petición el valor de lo que se tiene almacenado en esa
  // variable global
  
  const tempThreshold = parseFloat(req.body.triggerFields.temp_threshold)
  const limit = (req.body.limit !== undefined) ? req.body.limit : 50
  //const limit = 50
  const document = await getTriggerIdentity(triggerIdentity)
  
  if (document == null) {
    const doc = {
      triggerIdentity: triggerIdentity,
      tempThreshold: tempThreshold,
      events: []
    }
    addDocument('triggerIdentities', triggerIdentity, doc)
  }
  
  console.log(`trigger_identity: ${triggerIdentity}`)
  
  console.log(`Getting temperatures`)
  
  // TODO - Sacar la temperatura del cuerpo de la petición
  
  //const tempMeasure = Math.random() * (40 - 15) + 15
  
  const tempMeasure = (req.body.temperature !== undefined) ? parseFloat(req.body.temperature) : 0
  
  console.log(tempMeasure)
  
  if (tempMeasure >= tempThreshold) {
    console.log('Temperature is above threshold')
    console.log('Generating trigger data')
    
    updateTriggerIdentity(triggerIdentity, { lastNotification: tempMeasure })
    const event = {
      temp_measure: tempMeasure,
      created_at: (new Date()).toISOString(), // Must be a valid ISOString
      meta: {
        id: helpers.generateUniqueId(),
        timestamp: Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
      }
    }
    await addEvent(triggerIdentity, event)
  }
  
  //const aux = getEvents(triggerIdentity, limit)
  //console.log(aux)
  
  res.status(200).send({
    data: await getEvents(triggerIdentity, limit)
  })
});

const enableRealtimeAPI = async () => {
  try {
    //client.connect()
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')

    const documents = await mongoCollection.find()
    const triggerIdentities = []
    documents.forEach(async (triggerIdDoc) => {
      console.log(`${triggerIdDoc._id}: Checking if tempThreshold for Realtime API`)
      const { tempThreshold } = triggerIdDoc.tempThreshold
      
      triggerIdentities.push({ trigger_Identity: triggerIdDoc.id })
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
  } finally {
    //await client.close()
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