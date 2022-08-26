const mongodb = require('./mongodb')

module.exports = {
  
  generateEvent: async (triggerIdentity, value, aboveBelow, measureLabel, threshold) => {
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
  },
  
  getTestEvent: () => {
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
};

const generateUniqueId = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}