const cron = require('node-cron');

module.exports = function(){

    // Once every minute
    cron.schedule('* * * * *', () => {
        
    });

}