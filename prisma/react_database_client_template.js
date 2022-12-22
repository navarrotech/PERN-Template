import { io } from "socket.io-client";
import { v4 as uuid } from 'uuid'

const socket = io(process.env.REACT_APP_API, {
    withCredentials: true,
    reconnectionDelayMax: 10000
});

const activeQueries = {}

socket.on('invalid', (message, { id }) => {
    if(activeQueries[id]){
        activeQueries[id](null, { code:"400", message })
    }
})
socket.on('error', (error, { id }) => {
    if(activeQueries[id]){
        activeQueries[id](null, error)
    }
})
socket.on('value', (value, { id, options }) => {
    if(activeQueries[id]){
        activeQueries[id](value)
    }
})

function emit(method, table, query, callback, options={}){
    console.log("Running request")
    return new Promise((accept, reject) => {
        let id = uuid()
        activeQueries[id] = function(value, error){
            if(error){ return reject(error) }
            try{ delete activeQueries[id] } catch(e){ /* console.log(e) */ }
            if(callback)
                callback(value)
            accept(value)
        }
        console.log("Emitting now!")
        socket.emit(method, {
            id, table, query, options
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