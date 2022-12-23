import { io } from "socket.io-client";
import { v4 as uuid } from 'uuid'

const socket = io(process.env.REACT_APP_API, {
    // withCredentials: true,
    reconnectionDelayMax: 2 * 1000
});

const activeQueries = {}

socket.on('invalid', (message, { id }={}) => {
    if(id && activeQueries[id]){
        activeQueries[id](null, { status: "invalid", code:"400", message })
    }
})
socket.on('unauthorized', (message, { id }={}) => {
    if(id && activeQueries[id]){
        activeQueries[id](null, { status: "unauthorized", code:"401", message })
    }
})
socket.on('error', (error, { id }={}) => {
    if(id && activeQueries[id]){
        activeQueries[id](null, { status: "error", code:"500", message:error })
    }
})
socket.on('value', (value, params) => {
    let { id } = params
    if(params.isSubscription){ value = (Array.isArray(value)) ? value[0] : value }
    if(activeQueries[id]){
        activeQueries[id](value)
    }
})
// socket.on('connect',    () => { console.log("Connected to Realtime Database");    })
// socket.on('disconnect', () => { console.log("Disconnected to Realtime Database"); })
// Manual reconnection...
// socket.on('disconnect', () => {
//     let reconnecting = setInterval(() => {
//         if(socket.active()){ clearInterval(reconnecting) }
//         socket.connect()
//     }, 3000)
// })

function emit(type, table, query, callback, options={}){
    return new Promise((accept, reject) => {
        let id = uuid()
        activeQueries[id] = function(value, error){
            if(error){ return reject(error) }
            try{ delete activeQueries[id] } catch(e){ /* console.log(e) */ }
            if(callback)
                callback(value)
            accept(value)
        }
        socket.emit('realtime', {
            type, id, table, query, options
        })
    })
}

// socket.emit("hello", { a: "b", c: [] })
function get(table_name){
    return function(query, callback, options){
        return emit('get', table_name, query, callback, options)
    };
}
function set(table_name){
    return function(query, callback, options){
        return emit('set', table_name, query, callback, options)
    };
}
function push(table_name){
    return function(query, callback, options){
        return emit('push', table_name, query, callback, options)
    };
}
function upsert(table_name){
    return function(query, callback, options){
        return emit('upsert', table_name, query, callback, options)
    };
}
function deleteMany(table_name){
    return function(query, callback, options){
        return emit('delete', table_name, query, callback, options)
    };
}
function onValue(table){
    return function(query, callback, options={}){
        let id = uuid()
        activeQueries[id] = callback
        socket.emit('subscribe', { id, table, query, options })
        return function unsubscribe(){
            socket.emit('unsubscribe', { id, table })
            try{ delete activeQueries[id] } catch(e){}
        }
    };
}