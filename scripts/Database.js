const { Pool } = require('pg')

const pool = new Pool()

pool.on('error', (err, client) => {
    console.error('Unexpected error on postgres pool', err)
    // process.exit(-1)
})

export default pool