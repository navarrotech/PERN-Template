const schema  = require('../prisma/schema.js')
const { PrismaClient } = require('@prisma/client')
const session = require('./Session.js')

const prisma = new PrismaClient()

// https://www.postgresql.org/docs/current/sql-notify.html

const listeners = {
    // Psuedo-code
    // "table_name": [
//         { primary_value: 1, primary_key:'id' callback:function(){}, id: "subscriber_id_1" },
//         { primary_value: 2, primary_key:'id' callback:function(){}, id: "subscriber_id_2" },
//         { primary_value: 3, primary_key:'id' callback:function(){}, id: "subscriber_id_3" },
    // ]
}
const subscribers = {
    // Psuedo-code
    // "socket.id":[
    //     "subscriber_id_1",
    //     "subscriber_id_2",
    //     "subscriber_id_3"
    // ]
}

function unsubscribeListener(table, id){
    if(!listeners[table]){ return; }
    listeners[table] = listeners[table].filter(a => a.id != id)
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
        if(!query){ socket.emit('invalid', "Invalid request: Must include a query in your request!", { type, ...params }); return false; }

        // Must have a valid type
        if(!type || !['get', 'set', 'push', 'upsert', 'delete'].includes(type)){ socket.emit('invalid', "Invalid request: Must include a query in your request!", { type, ...params }); return false; }

        // Table rules : Table must exist and security rules must exist
        if(!prisma[table]){ socket.emit('invalid', "Table does not exist", { type, ...params }); return false; }

        // Security Rules
        const rules = schema.security[table]
        if(!rules){ socket.emit('unauthorized', "You don't have permission to do anything to " + table, { type, ...params }); return false; }

        let security_mode = type === 'get' ? 'read' : 'write'

        let check = SecurityCheck(rules[security_mode], socket, params)
        if(!check){ socket.emit('unauthorized', "You don't have permission to " + security_mode + " " + table, { type, ...params }); return false; }
        if(typeof can_pass === 'object' && ['get', 'set', 'delete'].includes(type)){
            try{
                query = Object.assign({}, query, can_pass)
            } catch(e){
                console.log(e);
                socket.emit('unauthorized', "You don't have permission to  " + security_mode + " " + table, { type, ...params });
                return false;
            }
        }
        
        let value;
        if(type === 'get'){ value = await prisma[table].findMany(query) }
        if(type === 'delete'){
            value = await prisma[table].findMany(query)
            await prisma[table].deleteMany(query)
        }
        if(type === 'set'){
            await prisma[table].updateMany(query)
            value = await prisma[table].findMany({ where:{ ...query.where } })
        }
        if(type === 'upsert'){
            await prisma[table].upsert(query)
                .catch(e => {
                    console.log(e)
                    console.log({ errorcode: e.code })
                    socket.emit('error', "Something went wrong trying to upsert... Please check the server console for more details!", { type, ...params });
                    return false;
                })
        }
        if(type === 'push'){
            // In case they only pass a single object, not an array of objects...
            if(!Array.isArray(query.data)){
                query.data = [ query.data ]
            }
            value = await prisma[table]
                .createMany(query)
                .catch(e => {
                    if(e.code && e.code === 'P2002'){
                        return socket.emit('invalid', "Issue with unique constraint" + (e.meta && e.meta.target ? ' on ' + e.meta.target.join(', ') : ''), { type, ...params });
                    }
                    if(e.message && e.message.includes('Note: Lines with + are required, lines with ? are optional.')){
                        let missing_field = ''
                        try{
                            let index_1 = e.message.indexOf('Argument '),
                                index_2 = e.message.indexOf(' is missing.')
                            missing_field += ' :: ' + e.message.substring(index_1, index_2)
                        } catch(err){}
                        return socket.emit('invalid', "Missing required field!"+missing_field, { type, ...params });
                    }
                    console.log(e)
                    socket.emit('error', "Something went wrong trying to set those documents... Perhaps a required field was null?", { type, ...params });
                    return false;
                })
        }

        socket.emit('value', value, params)

        // Subscribers
        if(['set', 'delete'].includes(type) && id && listeners[table]){
            // Might have multiple rows that were updated
            value.forEach(val => {
                // Find each listener that is relevant
                // Primary key might be like "id" or "owner", and then the primary value is the actual row id
                // For exmaple, users subscribe to the row in "users" table with 'id' (primary key) of 20 'primary_value'
                let relevant_listeners = listeners[table].filter(a => {
                    // console.log(`${a.primary_value} === ${val[a.primary_key]}`)
                    return a.primary_value === val[a.primary_key]
                })
                if(relevant_listeners && relevant_listeners.length){
                    relevant_listeners.forEach(subscription => {
                        subscription.callback(type==='delete'?null:val)
                        if(type === 'delete'){
                            unsubscribeListener(subscription.id)
                        }
                    })
                }
            })
        }

        return value;
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
        socket.on('subscribe', async (params={}) => {
            // This will immediately send an initial value to the user
            // It will return true if the user is allowed to read it.
            // If they can't read it, then handleRequest() will already take care of all error reporting.
            // If they can read it, then we can subscribe them.
            let is_valid_request = await handleRequest(socket, { type:'get', isSubscription: true, ...params })
            if(is_valid_request !== false && params.id && params.table){
                if(is_valid_request.length){ is_valid_request = is_valid_request[0] }
                let { id, table, options={} } = params;

                let primary_key   = options.primary_key || 'id',
                    primary_value = is_valid_request[primary_key]

                if(!primary_value){
                    return socket.emit('invalid', "Primary key doesn't match any column in table " + table, { ...params })
                }

                if(!listeners[table]){ listeners[table] = [] }

                listeners[table].push({
                    id,
                    primary_key,
                    primary_value,
                    callback: function(value){
                        socket.emit('value', value, { id, isSubscription: true, ...params })
                    }
                })
            }
        });

        socket.on('unsubscribe', ({ id, table }) => {
            if(!id || !table || !listeners[table]){ return; }
            try { 
                unsubscribeListener(table, id)
            } catch(e){ console.log(e); }
        });

        socket.on('disconnect', () => {
            // Remove all active listeners/subscriptions
            if(subscribers[socket.id]){
                subscribers[socket.id].forEach(sub => { unsubscribeListener(sub.table, sub.id) })
                delete subscribers[socket.id]
            }
            // console.log(socket.id + " disconnected.")
        });

    });
}