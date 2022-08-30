import * as mongodb from './mongodb.js';

/**
* Generate a new event with the values passed by parameter and add it to Mongodb database
*
* @param {string} triggerIdentity - The triggerIdentity this events is related to
* @param {number} value - The value of the measure taken
* @param {string} aboveBelow - Indicates if the trigger fires when the value is > or < than threshold
* @param {string} measureLabel - Label of the measure
* @param {number} threhsold - Value of the threshold
*/
export async function generateEvent(triggerIdentity, value, aboveBelow, measureLabel, threshold) {
  console.log(measureLabel + ' is ' + aboveBelow + ' threshold')
  console.log('Generating trigger data')

  mongodb.updateTriggerIdentity(triggerIdentity, { lastNotification: value })
  const event = {
    measure_value: value,
    measure_label: measureLabel,
    above_below: aboveBelow,
    threshold_value: threshold,
    created_at: (new Date()).toISOString(), // Must be a valid ISOString
    meta: {
      id: generateUniqueId(),
      timestamp: Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
    }
  }
  await mongodb.addEvent(triggerIdentity, event)
}

/**
* Generates a test event with default values
*
* @return {object} - The event generated
*/
export function getTestEvent() {
  const event = {
    measure_value: 0,
    measure_label: "test",
    above_below: "test",
    threshold_value: 0,
    created_at: (new Date()).toISOString(), // Must be a valid ISOString
    meta: {
      id: generateUniqueId(),
      timestamp: Math.floor(Date.now() / 1000) // This returns a unix timestamp in seconds.
    }
  }
  return event
}

/**
* Generates a new unique ID
*
* @return {string} - The unique ID
*/
export function generateUniqueId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
  * Generates a new unique ID locally
  *
  * @return {string} - The unique ID
  */
/*const generateUniqueId = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}*/