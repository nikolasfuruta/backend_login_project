require('dotenv').config();
const express = require('express');
const path = require('path');
const { logger } = require('./middleware/logEvents');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//create app
const app = express();

//connect DB
connectDB();

//Middleware -> everything between req and res
//Custom log middleware
app.use(logger)

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

//Cross Origin Resource Sharing middleware
//com o cors eu consigo controlar quem pode acessar o meu api
app.use(cors(corsOptions));

//Buit-in middleware to handle urlencoded data
//'content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({extended: false}));

//for json
app.use(express.json());

//middleware for cookie
app.use(cookieParser());

//como é em cascata, aqui é definido o dir para o express buscar um conteúdo 
//para aplicar em todo o resto
app.use('/',express.static(path.join(__dirname,'public')));

//routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

//protected route
app.use(verifyJWT);//this works because it is like water fall
app.use('/employees', require('./routes/api/employees'));
app.use('/users', require('./routes/api/users'));

//404 definition
app.all('*', (req,res) => { //qualquer rota que não seja uma das acima, é direcionado para cá
    res.status(404)
    if(req.accepts('html')) {//se tiver a extensão html
        res.sendFile(path.join(__dirname,'views','404.html'));
    }
    else if(req.accepts('json')) {//se tiver a extensão json
        res.json({err: '404 Not Found'})
    }
    else {
        res.type('txt').send('404 Not Found')
    }
    
});

//express custom error handler
app.use(errorHandler);

//connect and listen
mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB')
    //start the server
    app.listen(PORT, ()=>{
        console.log(`Server running on PORT ${PORT}`);
    });
})



//Route handlers -> next
//definition 1
// app.get('/hello(.html)?', (req,res,next) => {
//     console.log('attempted to load hello.html')
//     next()
// }, (req,res) => { res.send('Hello World') }) //next function

//definition 2
// const one = (req,res,next) => { 
//     console.log('one'); 
//     next(); 
// }

// const two = (req,res,next) => { 
//     console.log('two');
//     next(); 
// }

// const three = (req,res) => { 
//     console.log('three'); 
//     res.send('finished'); 
// }

// app.get('/chain(.html)?', [one, two, three]);