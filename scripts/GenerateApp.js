const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

module.exports = function(){
    const app = express()

    app.use(express.static('./client/build'));

    app.enable('trust proxy')
    app.use( helmet({ contentSecurityPolicy: false }) )

    app.use(express.json());
    app.use(cookieParser());

    return app
}