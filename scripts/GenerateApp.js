const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

const session = require('express-session')
const PGStore = require('connect-pg-simple')(session)

const PG_Pool = require('./Database.js')

const { NODE_ENV='developemnt' } = process.env

module.exports = function(){
    const app = express()

    if(NODE_ENV === 'production'){
        app.use('*', cors({
            origin: true,
            credentials:true
        }))
    }

    // For the front-end react.js
    app.use(express.static('./client/build'));

    app.enable('trust proxy')
    app.use( helmet({ contentSecurityPolicy: false }) )
    app.use(cookieParser());

    // Parse incoming POST request bodys
    app.use(express.json({ limit:'100mb' }));
    // If they've sent an invalid JSON in the body of a POST request, let's catch it here!
    app.use(function(err, req, res, next) {
        if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
            // do your own thing here 👍
            res.status(400).send({ code: 400, message: "Bad request: Please check your JSON body payload" }); return;
        } else next();
    });


    app.use(session({
        secret: 'kuaecuXRemBJpuuNeuBXjijaaixejXBR',
        name: 'sid',
        resave: true, // Save even if nothing is changed
        saveUninitialized: false, // Save even if nothing has been set in req.session yet
        rolling: true,
        cookie: {
            secure: NODE_ENV === 'production',
            httpOnly: true,
            sameSite: true,
            maxAge: 1000 * 60 * 60 * 4 // 4 hours
        },
        store: new PGStore({
            pool: PG_Pool,
            createTableIfMissing: true,
            tableName : 'sessions'
        })
    }))

    return app
}