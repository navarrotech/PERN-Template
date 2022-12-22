const session = require('express-session')
const PGStore = require('connect-pg-simple')(session)

module.exports = session({
    secret: 'kuaecuXRemBJpuuNeuBXjijaaixejXBR',
    name: 'sid',
    resave: true, // Save even if nothing is changed
    saveUninitialized: false, // Save even if nothing has been set in req.session yet
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 4 // 4 hours
    },
    store: new PGStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        tableName : 'sessions'
    })
})