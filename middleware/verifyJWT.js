require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyJWT = (req,res,next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;//Bearer token
  if(!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(' ')[1];//get 'token' part

  //verify token
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if(err) return res.sendStatus(403);//forbidden (invalid token)
      req.user = decoded.UserInfo.username;//this info comes from payLoad, that setted with username and roles
      req.roles = decoded.UserInfo.roles
      next();
    }
  );
}

module.exports = verifyJWT;