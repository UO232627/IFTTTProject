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
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection(collection)
    await mongoCollection.insertOne(doc)
}

const updateTriggerIdentity = async (paramTriggerIdentity, updateProp) => {
    console.log(`Updating trigger identity ${paramTriggerIdentity}`)
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: updateProp })
}

const addEvent = async (paramTriggerIdentity, event) => {
    console.log(`Adding event ${event.meta.id} to triggerIdentity ${paramTriggerIdentity}`)
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
        /*if (eventsArr.length > 50) {
          eventsArr.pop()
        }*/
        mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: { events: eventsArr } })
      }
      else {
        console.log('Document does nos exist for triggerIdentity ', paramTriggerIdentity)
      }
    })
}

const deleteTriggerIdentityField = async (paramTriggerIdentity, field) => { // Esto no se usa, lol
    console.log(`deleting field ${field} from triggerIdentity ${paramTriggerIdentity}`)
    
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
}

const getTriggerIdentity = async (paramTriggerIdentity) => {
    console.log(`Get triggerIdentity ${paramTriggerIdentity}`)
    
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    return await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
}

const deleteTriggerIdentity = async (paramTriggerIdentity) => {
    console.log(`Delete triggerIdentity ${paramTriggerIdentity}`)
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')
    await mongoCollection.deleteOne({ triggerIdentity: paramTriggerIdentity })
}

const getEvents = async (paramTriggerIdentity, limit) => {
    console.log('Getting events array, limit is ', limit)
    if (limit <= 0) {
      return []
    }
    
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
}

const addNewPetition = async (doc, paramTriggerIdentity) => {
    console.log(`Adding new trigger with triggerIdentity ${paramTriggerIdentity} to database`)
    
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('nodered_petitions')
    
    await mongoCollection.insertOne(doc)
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
          },
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
  // variable global. Puede ser una variable global que se llame como el UUID del IAQ y
  // que dentro guarde un JSON con toda la info.
  
  // Otra opción es tener esta info. en una base de datos en Mongodb o donde sea y que
  // Node-RED pida los datos de la petición de ese IAQ cada vez que publique
  
  const tempThreshold = parseFloat(req.body.triggerFields.temp_threshold)
  const limit = (req.body.limit !== undefined) ? req.body.limit : 50
  //const limit = 50
  const document = await getTriggerIdentity(triggerIdentity)
  
  if (req.body.initial === undefined || req.body.initial === 1) {
    const docAux = {
      // Esto esta un poquito hardcodeado hasta que se puedan meter como parámetro al crear el trigger
      UUID: '7179d7d6-0f75-4b23-905b-16d670a7f7e1',
      measure: "voc",
      triggerIdentity: triggerIdentity,
      tempThreshold: tempThreshold,
      ifttt_source: req.body.ifttt_source,
      user: req.body.user
    }
    addNewPetition(docAux, triggerIdentity)
  }
  
  if (document == null) {
    const doc = {
      // Añadir aquí el UUID del IAQ??
      triggerIdentity: triggerIdentity,
      tempThreshold: tempThreshold,
      events: []
    }
    addDocument('triggerIdentities', triggerIdentity, doc)
  }
  
  console.log(`trigger_identity: ${triggerIdentity}`)
  
  // Se puede hacer aquí que compruebe si es un poll o una petición de Node-RED y si
  // es un poll hacer que no asigne temperatura, etc
  
  console.log(`Getting temperatures`)
  
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

// Trigge measure
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
  // variable global. Puede ser una variable global que se llame como el UUID del IAQ y
  // que dentro guarde un JSON con toda la info.
  
  // Otra opción es tener esta info. en una base de datos en Mongodb o donde sea y que
  // Node-RED pida los datos de la petición de ese IAQ cada vez que publique
  const threshold = parseFloat(req.body.triggerFields.threshold)
  
  const limit = (req.body.limit !== undefined) ? req.body.limit : 50
  //const limit = 50
  const document = await getTriggerIdentity(triggerIdentity)
  
  if (req.body.initial === undefined) {
    const docAux = {
      // Esto esta un poquito hardcodeado hasta que se puedan meter como parámetro al crear el trigger
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
  
  if (document == null) {
    const doc = {
      // Añadir aquí el UUID del IAQ??
      triggerIdentity: triggerIdentity,
      tempThreshold: threshold,
      events: []
    }
    addDocument('triggerIdentities', triggerIdentity, doc)
  }
  
  console.log(`trigger_identity: ${triggerIdentity}`)
  
  // Se puede hacer aquí que compruebe si es un poll o una petición de Node-RED y si
  // es un poll hacer que no asigne temperatura, etc
  
  console.log(`Getting temperatures`)
  
  //const tempMeasure = Math.random() * (40 - 15) + 15
  
  const measure = (req.body.temperature !== undefined) ? parseFloat(req.body.temperature) : 0
  
  console.log(measure)
  
  if (measure >= threshold) {
    console.log('Temperature is above threshold')
    console.log('Generating trigger data')
    
    updateTriggerIdentity(triggerIdentity, { lastNotification: measure })
    const event = {
      measure_value: measure,
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
    const database = client.db('prueba_mongo')
    const mongoCollection = database.collection('triggerIdentities')

    const documents = await mongoCollection.find()
    const triggerIdentities = []
    documents.forEach(async (triggerIdDoc) => {
      // Es correcto triggerIdDoc._id o sería triggerIdDoc.triggerIdentity??
      //console.log(`${triggerIdDoc._id}: Checking if tempThreshold for Realtime API`)
      console.log(`${triggerIdDoc.triggerIdentity}: Checking if tempThreshold for Realtime API`)
      const { tempThreshold } = triggerIdDoc.tempThreshold
      
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