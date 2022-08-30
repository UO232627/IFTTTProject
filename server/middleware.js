const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY;

module.exports = {
  
  /**
  * Checks if the key passed in a request is valid
  */
  serviceKeyCheck: function (req, res, next) {
    const key = req.get("IFTTT-Service-Key");
    
    if (key !== IFTTT_SERVICE_KEY) {
      res.status(401).send();
    }

    next();
  }
};