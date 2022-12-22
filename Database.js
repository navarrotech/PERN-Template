// const { Pool } = require('pg')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL
// })

// pool.on('error', (err, client) => {
//     console.error('Unexpected error on postgres pool', err)
//     // process.exit(-1)
// })

module.exports = prisma