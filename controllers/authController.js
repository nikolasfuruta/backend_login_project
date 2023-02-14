require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');


//authentication
const handleLogin = async (req,res) => {
  //verify if there is any cookie
  const cookies = req.cookies;

  const { username, password } = req.body;

  if(!username || !password) return res.status(400).json({'message': 'Username and password are required.'});

  //find user in the db
  const foundUser = await User.findOne({ username: username }).exec();
  //user not found
  if(!foundUser) return res.sendStatus(401);//Unauthorized
  //if user found, check the pwd
  const match = await bcrypt.compare(password, foundUser.password);//authorize the login if true
  //pwd not match
  if(!match) return res.sendStatus(401);

  //get user roles: ex. super-user, user, etc
  const roles = Object.values(foundUser.roles).filter(Boolean)

  //create jwt
  //access token
  const accessToken = jwt.sign( //this is 'public', so do not send an important data
    {
      "UserInfo": {
        "username": foundUser.username, 
        "roles": roles//permissions
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10s' }
  );
  //create refresh token
  const newRefreshToken = jwt.sign(
    {"username": foundUser.username},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  //if there is not a cookie
  const newRefreshTokenArray = !cookies?.jwt
  ? foundUser.refreshToken 
  : foundUser.refreshToken.filter(refresh => refresh !== cookies.jwt);

   //if there is a cookie
  if(cookies?.jwt){
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite:'None' });
  }

  //save refresh token in DB
  foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];//altera o refresh que está no DB
  await foundUser.save();

  //send the Token to the user
  //cookies seted to 'httpOnly' is not available to JS
  res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite:'None', secure:true, maxAge: 24*60*60*1000 }) //secure:true - in production
  res.json({ accessToken });//not secure to store the accessToken into LocalStorage or cookies
}

module.exports = { handleLogin };
