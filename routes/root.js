const express = require('express');
const router = express.Router();
const path = require('path');

//Routes -> express accept Regex
router.get('^/$|/index(.html)?', (req,res) => {
  //res.send('Hello World'); //return a value;
  //res.sendFile('./views/index.html', {root: __dirname}); //return a file
  res.sendFile(path.join(__dirname,'..', 'views', 'index.html')); //return a file
});

module.exports = router;