// Mongodb configuration

// Import mongodb package
import { MongoClient } from 'mongodb';
// Define mongodb connection uri
const uri = "mongodb+srv://aas:aas@events.c5dzfdz.mongodb.net/?retryWrites=true&w=majority"
// Create mongodb client
const client = new MongoClient(uri)
// Connect to Mongodb database
const database = client.db("envira_ifttt")

/**
* Adds a document to Mongodb collection
*
* @param {string} collection - The name of the collection where the doc will be stored
* @param {string} id - The triggerIdentity
* @param {object} doc - The document that will be saved in the collection
*/
export async function addDocument(collection, id, doc) {
  console.log(`Adding document ${id} to collection ${collection}`)

  const mongoCollection = database.collection(collection);
  await mongoCollection.insertOne(doc)
}

/**
* Updates the triggerIdentity of a document in the collection triggerIdentities
*
* @param {string} paramTriggerIdentity - The triggerIdentity of the document
* @param {object} updateProp - The property that will be updated
*/
export async function updateTriggerIdentity(paramTriggerIdentity, updateProp) {
  console.log(`Updating trigger identity ${paramTriggerIdentity}`)

  const mongoCollection = database.collection('triggerIdentities')
  await mongoCollection.updateOne({ triggerIdentity: paramTriggerIdentity }, { $set: updateProp })
}

/**
* Adds an event to a document in triggerIdentities collection
*
* @param {stirng} triggerIdentity - The triggerIdentity of the document
* @param {object} event - The event that will be added to the document
*/
export async function addEvent(paramTriggerIdentity, event) {
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
}

/**
* Deletes a field from a document with triggerIdentity passed as parameter in triggerIdentity collection
*
* @param {string} paramTriggerIdentity - The triggerIdentity of the document
* @param {string} field - The field that will be deleted
*
* CURRENTLY NOT USED
*/
/*export async function deleteTriggerIdentityField(paramTriggerIdentity, field) {
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
}*/

/**
* Gets the document with triggerIdentity passed as parameter
*
* @param {string} triggerIdentity - The triggerIdentity of the doument
*
* @return {object} - The document found
*/
export async function getTriggerIdentity(paramTriggerIdentity) {
  console.log(`Get triggerIdentity ${paramTriggerIdentity}`)

  const mongoCollection = database.collection('triggerIdentities')
  return await mongoCollection.findOne({ triggerIdentity: paramTriggerIdentity })
}

/**
* Deletes a document with triggerIdentity passed as parameter in triggerIdentities collection
*
* @param {string} paramTriggerIdentity - The triggerIdentity of the document
*
* CURRENTLY NOT USED
*/
/*export async function deleteTriggerIdentity(paramTriggerIdentity) {
  console.log(`Delete triggerIdentity ${paramTriggerIdentity}`)

  const mongoCollection = database.collection('triggerIdentities')
  await mongoCollection.deleteOne({ triggerIdentity: paramTriggerIdentity })
}*/

/**
* Get the events list of a document with triggerIdentity passed as parameter
*
* @param {string} paramTriggerIdentity - The triggerIdentity of the document
* @param {number} limit - The max amount of events
*
* @return {array} - The array with the events of the document
*/
export async function getEvents(paramTriggerIdentity, limit) {
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
}

/**
* Adds to nodered_petitions collection the neccesary values to make a valid petition
*
* @param {object} doc - The object that will be added to the collection. It contains all neccesary info
* @param {string} triggerIdentity - The triggerIdentity of the document
*/
export async function addNewPetition(doc, paramTriggerIdentity) {
  console.log(`Adding new trigger with triggerIdentity ${paramTriggerIdentity} to database`)

  const mongoCollection = database.collection('nodered_petitions')

  const document = await mongoCollection.findOne({ uuid: doc.uuid, measure: doc.measure, triggerIdentity: paramTriggerIdentity, threshold: doc.threshold, 
                                            above_below: doc.above_below, ifttt_source: doc.ifttt_source, user: doc.user })

  if (document == null) {
    await mongoCollection.insertOne(doc) 
  }
}

/**
* Gets all documents in triggerIdentities collection to be used in RealtimeAPI
*
* @return {cursor} - The cursor with all the documents in triggerIdentities
*/
export async function getRealtimeAPIDocuments() {
  const mongoCollection = database.collection('triggerIdentities')

  const documents = await mongoCollection.find()
  
  return documents
}