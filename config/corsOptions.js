const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin,callback) => {
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) { //se a origem do req estiver no whitelist ou a origem for undefined(local)
            callback(null, true) //null pq não há erro, true pq foi permitido
        }
        else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;