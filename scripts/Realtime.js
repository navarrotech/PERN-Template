const schema  = require('../prisma/schema.js')
const session = require('./Session.js')

// https://www.postgresql.org/docs/current/sql-notify.html

const listeners = {}

async function handleRequest(socket, type, params){
    let { table, id, query } = params
    try{
        if(!prisma[table]){ return sendInvalid("Table does not exist", { type, ...params }) }
        if(!schema.security[table] || !schema.security[table].read){ return }

        let securityRule = schema.security[table].read
        if(typeof securityRule === 'function'){
            try {
                let can_pass = securityRule('request', 'session', params)
                if(!can_pass){ return; }
                if(typeof can_pass === 'object'){

                }
            } catch(e){ console.log(e); return; }
        }

        let value = await prisma[table].findMany(query)

        // Send back to client
        socket.emit(type, value, params)
        if(listeners[id]){ listeners[id](finalValue) }
    }
    catch(e){
        console.log("Caught error:", error)
        try{ socket.emit('error', error.message, { type, ...params })
        } catch(e){ console.log(e) }
    }
}

module.exports = function(io, prisma){

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(session))

    io.on('connection', (socket) => {

        console.log(socket.id + ' connected.')
        socket.emit("Connected");

        socket.on('get', async (params) => {
            // handleRequest(socket, 'get', params)
            console.log(socket.request.session)
        });

        // On Value
        // Currently only supports a single document being listened to at a time
        socket.on('subscribe', async ({ table, id, query }) => {
            try {
                if(!prisma[table]){ return sendInvalid("Table does not exist", { type:'get', table, id, query }) }

                listeners[id] = function(value){
                    socket.emit('get', value, { id, query })
                }

                let value = await prisma[table].findUnique(query)

                // Send back to client
                socket.emit('get', value, { table, id, query })
                if(listeners[id]){ listeners[id](finalValue) }
            }
            catch(e){
                sendError(e, { type:'get', table, id, query })
            }
        });

        socket.on('unsubscribe', ({ id, query }) => {
            try{ delete listeners[id] }
            catch(e){ console.log(e); }
        });

        // Push
        socket.on('push', async ({ table='', id, query={} }) => {
            try{
                if(!prisma[table]){ return sendInvalid("Table does not exist", { type:'push', table, id, query }) }
                let value = await prisma[table].create({ data: query })

                // Send back to client
                socket.emit('get', value, { id, query })
                if(listeners[id]){ listeners[id](finalValue) }
            }
            catch(e){
                sendError(e, { type:'push', table, id, query })
            }
        });

        socket.on('set', async ({ table, id, query }) => {
            try{
                if(!prisma[table]){ return sendInvalid("Table does not exist", { type:'push', table, id, query }) }
                let value = await prisma[table].update({ data: query })

                // Send back to client
                socket.emit('get', finalValue, { table, id, query })
                if(listeners[id]){ listeners[id](finalValue) }
            }
            catch(e){
                sendError(e, { type:'push', table, id, query })
            }
        });

        socket.on('disconnect', () => {
            // console.log(socket.id + " disconnected.")
        });

        function sendInvalid(message="", payload={}){
            try{
                socket.emit('invalid', message, payload)
            } catch(e){ console.log(e) }
        }

        function sendError(error, payload={}){
            console.log("Caught error:", error)
            try{
                socket.emit('error', error.message, payload)
            } catch(e){ console.log(e) }
        }

    });
}