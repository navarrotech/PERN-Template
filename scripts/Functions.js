const path = require('path')
const fs = require('fs')

function setupDirectory(pathname, app, history=[]){
    fs.readdirSync(pathname).forEach((file_name) => {
        let file_path = path.join(pathname, file_name)
        let file = fs.lstatSync(file_path)
        // If it's a directory, keep scanning!
        if(file.isDirectory()){
            return setupDirectory(file_path, app, [ ...history, file_name ])
        }
        // If it's a file, initialize it!
        app.post(history.join('/') + '/' + file_name, require(path.join('../', file_path)))
    });
}

module.exports = function(app){
    setupDirectory('./functions', app)
}
