const User = require('../model/User');

const handleLogout = async (req,res) => {
  //On client, also delete the accessToken
  const cookies = req.cookies
  if(!cookies?.jwt) return res.sendStatus(204);//No content
  const refreshToken = cookies.jwt;

  //Is refreshToken in DB?
  const foundUser = await User.findOne({ refreshToken }).exec();
  //in case there is a cookie but not a user with refresh token
  if(!foundUser) {
    //clear coockie
    res.clearCookie('jwt', { httpOnly: true, secure: true , maxAge: 24*60*60*1000 })
    return res.sendStatus(204)
  }

  //delete refresh token in DB
  const updateRefreshToken= foundUser.refreshToken.filter(refresh => refresh !== refreshToken);
  await foundUser.updateOne({ refreshToken: updateRefreshToken });

  //clear coockie
  res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite:'None' });// secure: true - only serves on https
  res.sendStatus(204)
}

module.exports = { handleLogout }
