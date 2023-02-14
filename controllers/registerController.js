const bcrypt = require('bcrypt');
const User = require('../model/User');

//controller for registry new user
const handleNewUser = async (req,res) => {
  const { username, password} = req.body;

  //verify if username and pwd exist
  if(!username || !password) {
    return res.status(400).json({'message': 'Username and password are required.'});
  }

  //check for duplicate usernames in the db
  const isDuplicate = await User.findOne({ username: username }).exec();
  if(isDuplicate) return res.sendStatus(409); //Conflict http statuscode
  
  //register
  try{
    //encrypt the pwd
    const hashedPawd = await bcrypt.hash(password, 10);
    //create and store new user
    const result = await User.create({
      'username': username, 
      'password': hashedPawd//pwd is hashed
    }); 

    //console.log(result);
    res.status(201).json({'success': `New user ${username} created.`})
  }
  catch(err) {
    res.sendStatus(500).json({'message': err.message})
  }
}


module.exports = { handleNewUser };