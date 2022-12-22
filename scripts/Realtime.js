const schema  = require('../prisma/schema.js')
const { PrismaClient } = require('@prisma/client')
const session = require('./Session.js')

const prisma = new PrismaClient()

// https://www.postgresql.org/docs/current/sql-notify.html

const listeners = {
    // Psuedo-code
    // "table_name":{
//         { primary_value: 1, primary_key:'id' callback:function(){}, id: "subscriber_id_1" },
//         { primary_value: 2, primary_key:'id' callback:function(){}, id: "subscriber_id_2" },
//         { primary_value: 3, primary_key:'id' callback:function(){}, id: "subscriber_id_3" },
    // }
}
const subscribers = {
    // Psuedo-code
    // "socket.id":[
    //     "subscriber_id_1",
    //     "subscriber_id_2",
    //     "subscriber_id_3"
    // ]
}

function SecurityCheck(securityRule, socket, params){
    if(!securityRule){ return false }
    if(typeof securityRule === 'function'){
        try {
            let can_pass = securityRule(socket.request, socket.request.session, params)
            if(!can_pass){ return false }
            return can_pass;
        } catch(e){ console.log(e); return false }
    }
}

async function handleRequest(socket, params){
    const { type, table, id, query } = params
    try{
        // Must have a query
        if(!query){ socket.emit('invalid', "Invalid request: Must include a query in your request!"); return false; }

        // Must have a valid type
        if(!type || !['get', 'set', 'push'].includes(type)){ socket.emit('invalid', "Invalid request: Must include a query in your request!"); return false; }

        // Table rules : Table must exist and security rules must exist
        if(!prisma[table]){ socket.emit('invalid', "Table does not exist", { type, ...params }); return false; }

        // Security Rules
        const rules = schema.security[table]
        if(!rules){ socket.emit('unauthorized', "You don't have permission to do anything to " + table, { type, ...params }); return false; }

        if(type === 'get'){
            let check = SecurityCheck(rules.read, socket, params)
            if(!check){ socket.emit('unauthorized', "You don't have permission to read " + table, { type, ...params }); return false; }
            if(typeof can_pass === 'object'){
                try{ query = Object.assign({}, query, can_pass) } catch(e){ console.log(e); socket.emit('unauthorized', "You don't have permission to write " + table, { type, ...params }); return false; }
            }
        }
        else{
            let check = SecurityCheck(rules.write, socket, params)
            if(!check){ socket.emit('unauthorized', "You don't have permission to write " + table, { type, ...params }); return false; }
            // At this point, if it's not false then we can assume push is allowed.
            if(type === 'set'){
                if(typeof can_pass === 'object'){
                    try{ query = Object.assign({}, query, can_pass) } catch(e){ console.log(e); socket.emit('unauthorized', "You don't have permission to write " + table, { type, ...params }); return false; }
                }
            }
            // TODO: Security requirements for 'push'
        }
        
        let value;
        if(type === 'get'){ value = await prisma[table].findMany(query) }
        if(type === 'set'){ value = await prisma[table].updateMany(query) }
        // TOOD: Needs custom security rules, plus createMany vs create support
        if(type === 'push'){ value = await prisma[table].createMany(query) }

        socket.emit('value', value, params)

        // Subscribers
        if(type === 'set' && id && listeners[table]){
            let relevant_listeners = listeners[table].find(a => {
                return primary_value === value[primary_key]
            })
            if(relevant_listeners && relevant_listeners.length){
                relevant_listeners.forEach(listener => listener(callback(value)))
            }
        }

        return { value };
    }
    catch(error){
        console.log("Caught error:", error)
        try{ socket.emit('error', error.message, { type, ...params })
        } catch(e){ console.log(e) }
    }
}

module.exports = function(io){

    const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
    io.use(wrap(session))

    io.on('connection', (socket) => {

        socket.emit("Connected");

        socket.on('realtime', async (params) => { handleRequest(socket, params) });

        // User can subscribe to a specific document, and get re-updated everytime the document changes.
        socket.on('subscribe', async (params) => {
            // This will immediately send an initial value to the user
            // It will return true if the user is allowed to read it.
            // If they can't read it, then handleRequest() will already take care of all error reporting.
            // If they can read it, then we can subscribe them.
            let is_valid_request = handleRequest(socket, { type:'get', ...params })
            if(is_valid_request !== false && params.id && params.table){
                if(is_valid_request.length){ is_valid_request = is_valid_request[0] }
                let { id, table, options={} } = params;

                let primary_key   = options.primary_key || 'id',
                    primary_value = is_valid_request[primary_key]

                if(!primary_value){
                    return socket.emit('invalid', { ...params, message: "Primary key doesn't match any column in table " + table })
                }

                listeners[table].push({
                    id,
                    primary_key,
                    primary_value,
                    callback: function(value){
                        socket.emit('get', value, { id, ...params })
                    }
                })
            }
        });
        socket.on('unsubscribe', ({ id, table }) => {
            if(!id || !table || !listeners[table]){ return; }
            try { 
                listeners[table] = listeners[table].filter(a => a.id != id)
            } catch(e){ console.log(e); }
        });

        socket.on('disconnect', () => {
            // Remove all active listeners/subscriptions
            if(subscribers[socket.id]){
                subscribers[socket.id]
                    .forEach(sub => {
                        listeners[sub.table] = listeners[sub.table].filter(a => a.id != sub.id)
                    })
                delete subscribers[socket.id]
            }
            // console.log(socket.id + " disconnected.")
        });

    });
}