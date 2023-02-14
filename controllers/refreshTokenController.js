require('dotenv').config()
const jwt = require('jsonwebtoken');
const User = require('../model/User');

const handleRefreshToken = async (req,res) => {
  //the token is send by cookie when the user login
  const cookies = req.cookies;

  //verify if cookies exist
  if(!cookies?.jwt) return res.sendStatus(401);

  //define refresh token
  const refreshToken = cookies.jwt;

  //delete received cookie
  res.clearCookie('jwt', { httpOnly: true, sameSite:'None', secure: true });// secure: true - only serves on https

  //find user with same refresh token into the db
  const foundUser = await User.findOne({ refreshToken }).exec();

  //verify if refresh token is valid
  if(!foundUser) {
    jwt.verify(
      refreshToken,//getted by cookie
      process.env.REFRESH_TOKEN_SECRET,
      async (err,decoded) => {
        //if the refresh token is invalid
        if(err) return res.sendStatus(403);//Forbidden
        //if refresh token is valid
        //check if there is an user with decoded data
        const hackedUser = await User.findOne({ username: decoded.username }).exec();
        hackedUser.refreshToken = []; //zera o refresh token
        await hackedUser.save(); //e salva
      });
    return res.sendStatus(403);//Forbidden
  }

  //if user exist
  //exclude the old refresh token
  const newRefreshTokenArray = foundUser.refreshToken.filter(refresh => refresh !== refreshToken)

  //evaluate jwt
  jwt.verify(
    refreshToken,//getted by cookie
    process.env.REFRESH_TOKEN_SECRET,
    async (err,decoded) => {
      //if the user was found but the refresh token is invalidate
      if(err){
        const updateRefreshToken = [...newRefreshTokenArray]
        const result = await foundUser.updateOne({ refreshToken: updateRefreshToken });
      } 

      if(err || foundUser.username !== decoded.username) return res.sendStatus(403)
      
      //refresh token still valid
      const roles = Object.values(foundUser.roles);
      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "username": decoded.username,
            "roles": roles
          }
        },
          process.env.ACCESS_TOKEN_SECRET,
          {expiresIn: '10s'}
      );
        //create new refresh token
      const newRefreshToken = jwt.sign(
        {"username": foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
      );

      //save refresh token in DB
      const updateRefreshToken = [...newRefreshTokenArray, newRefreshToken];
      result = await foundUser.updateOne({ refreshToken: updateRefreshToken });
      //send the Token to the user
      res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite:'None', secure:true, maxAge: 24*60*60*1000 }) //secure:true - in production

      return res.json({ user:decoded.username, accessToken })
    }
  );
}

module.exports = { handleRefreshToken }
