require('dotenv').config()
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];  
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("decoded", decoded)
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid  or Expired");
  }
  return next();

 };

module.exports = verifyToken;