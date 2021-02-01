const jwt = require('jsonwebtoken');
const config = require('config');


module.exports = function (req, res, next) {
  const token = req.query.token;
  console.log(token);
  if (!token) return res.status(401).json({ message: 'Auth Error' });

  try {
    const decoded = jwt.verify(token, config.JWTSecret);
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: 'Invalid Token' });
  }
};
