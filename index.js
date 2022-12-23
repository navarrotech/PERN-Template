require('dotenv').config() // Load environment file

const http    = require('http');
const socketio = require('socket.io');

const GenerateApp         = require('./scripts/GenerateApp.js') // Returns Express App With All Middlwares Attached
const ServeFunctions      = require('./scripts/Functions.js')   // Serves all functions in the /functions folder as POST requests under their path and name
const UseRealtimeDatabase = require('./scripts/Realtime.js')    // Socket based CRUD operations from the browser (like-grpahql) using prisma commands. Security rules are defined in ./prisma/schema.js
const RecurringFunctions  = require('./scripts/Scheduled.js')   // For functions that loop. Useful for scheduled jobs or cron

const { PORT=8080, NODE_ENV='development' } = process.env;

const app = GenerateApp()

// Serve client React.js files to all GET routes!
app.get('*', (req, res) => res.sendFile('./client/build/index.html', { root:'./' }))

ServeFunctions(app)

const server = http.createServer(app)
const Socket = socketio(server, {
    cors: { origin: true },
    cookie: true
})
UseRealtimeDatabase(Socket)
RecurringFunctions()

server.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode, on port ${PORT}${NODE_ENV === 'development'?' and is available at http://localhost:'+PORT:''}`)
})