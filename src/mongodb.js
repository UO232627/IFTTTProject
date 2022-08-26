const { MongoClient } = require('mongodb')
const uri = "mongodb+srv://aas:aas@events.c5dzfdz.mongodb.net/?retryWrites=true&w=majority"
const client = new MongoClient(uri)
const database = client.db("envira_ifttt")

const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY;

module.exports = {
  addDocument: async (collection, id, doc) => {
    console.log(`Adding document ${id} to collection ${collection}`)
  
    const mongoCollection = database.collection(collection);
    await mongoCollection.insertOne(doc)
  },
  
  updateTriggerIdentity: async (paramTriggerIdentity, updateProp) => {
    console.log(`Updating trigger identity ${paramTriggerIdentity}`)
  
    const mongoCollection = database.collection('triggerIdentities')
    await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: updateProp })
  },
  
  addEvent: async (paramTriggerIdentity, event) => {
    console.log(`Adding event ${event.meta.id} to triggerIdentity ${paramTriggerIdentity}`)
  
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
  },
  
  deleteTriggerIdentityField: async (paramTriggerIdentity, field) => {
    console.log(`deleting field ${field} from triggerIdentity ${paramTriggerIdentity}`)

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
  },
  
  getTriggerIdentity: async (paramTriggerIdentity) => {
    console.log(`Get triggerIdentity ${paramTriggerIdentity}`)

    const mongoCollection = database.collection('triggerIdentities')
    return await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
  },
  
  deleteTriggerIdentity: async (paramTriggerIdentity) => {
    console.log(`Delete triggerIdentity ${paramTriggerIdentity}`)

    const mongoCollection = database.collection('triggerIdentities')
    await mongoCollection.deleteOne({ triggerIdentity: paramTriggerIdentity })
  },

  getEvents: async (paramTriggerIdentity, limit) => {
    console.log('Getting events array, limit is ', limit)

    if (limit <= 0) {
      return []
    }

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
  },

  addNewPetition: async (doc, paramTriggerIdentity) => {
    console.log(`Adding new trigger with triggerIdentity ${paramTriggerIdentity} to database`)

    const mongoCollection = database.collection('nodered_petitions')

    const document = await mongoCollection.findOne({ uuid: doc.uuid, measure: doc.measure, triggerIdentity: paramTriggerIdentity, threshold: doc.threshold, 
                                             above_below: doc.above_below, ifttt_source: doc.ifttt_source, user: doc.user })

    if (document == null) {
      await mongoCollection.insertOne(doc) 
    }
  },
  
  getRealtimeAPIDocuments: async () => {
    const mongoCollection = database.collection('triggerIdentities')

    const documents = await mongoCollection.find()
    
    return documents
  }
};