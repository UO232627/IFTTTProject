const IFTTT_SERVICE_KEY = process.env.IFTTT_SERVICE_KEY;

/**
* Checks if the key passed in a request is valid
*/
export function serviceKeyCheck(req, res, next) {
  const key = req.get("IFTTT-Service-Key");
  
  if (key !== IFTTT_SERVICE_KEY) {
    res.status(401).send();
  }

  next();
}