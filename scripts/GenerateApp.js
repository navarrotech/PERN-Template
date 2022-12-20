import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

export default function(){
    const app = express()

    app.use(express.static('./client/build'));

    app.enable('trust proxy')
    app.use( helmet({ contentSecurityPolicy: false }) )

    app.use(express.json());
    app.use(cookieParser());

    return app
}