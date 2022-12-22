require('dotenv').config({ path:__dirname + '/../.env' })
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs')
const path = require('path')


let { DATABASE_URL } = process.env
const { schema:schema_path, s, verbose=false, DATABASE_URL:CLI_URL, outputClient, skipTableGeneration=false } = argv

if(CLI_URL){ DATABASE_URL = CLI_URL }

if(!schema_path && !s){ throw new Error('No schema found! Try running npm run blueprint --schema PATH_TO_SCHEMA.js'); }
if(!DATABASE_URL){ throw new Error("Unable to connect to Postgres: No database url provided!") }

let schema;
try {
    schema = require(schema_path||s)
} catch(e){ console.log(e); throw new Error("Couldn't find schema at " + schema_path||s||''); }

console.log("Schema Loaded! Generating blueprint...")

if(!schema.tables){ return console.log("Schema exited prematurely: Did you add any tables to your schema?") }

const { Client } = require('pg')
const Postgres = new Client({
    connectionString: DATABASE_URL
})

function getTables(){
    return `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`
}
function getDatabases(){
    return `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';`
}

const database = schema.options && schema.options.database ? schema.options.database : 'postgres'

// Initialize Postgresql Database (Migration!)
async function _init(){
    let promises = []

    await Postgres.connect()
    if(verbose){ console.log("PostgreSQL Successfully Connected!") }
    
    // Table generation and column validation
    if(!skipTableGeneration){
        Object
            .keys(schema.tables)
            .forEach(table_name => {
                let sql_query = 'CREATE TABLE IF NOT EXISTS "' + table_name + '"(';
                let table = schema.tables[table_name]
    
                sql_query += Object
                    .keys(table)
                    .map(column_name => {
                        let column = table[column_name]
    
                        if(!column.type){ throw new Error(`No column type found for column ${column_name} in table ${table_name}`) }
                        
                        let sql_column = `${verbose?'\n\t':''}${column_name} ${column.type}`
    
                        // To add "not null"
                        if(column.null === false){ sql_column += ' NOT NULL' }
                        // To add "Default NULL" or "default (value)"
                        if(column.default !== undefined){
                            sql_column += column.default === null ? ' DEFAULT NULL' : ' DEFAULT ' + column.default
                        }
                        // Primary key
                        if(column.primaryKey){ sql_column += ' PRIMARY KEY' }
                        // Postfix, anything to add before it gets sent off for good.
                        if(column.postFix){ sql_column += ' ' +  column.postFix }
    
                        return sql_column
                    })
                    .join(',')
    
                sql_query += verbose?'\n);':');'
    
                promises.push(Postgres.query(sql_query))
    
                if(verbose){
                    console.log("  > Created table " + table_name)
                    console.log(sql_query)
                }
            })
    }

    // Function generation
    if(schema.functions){
        Object
            .keys(schema.functions)
            .forEach(function_name => {
                let function_text = schema.functions[function_name]
                if(verbose){ console.log("  > Creating function " + function_name + '...'); }
                promises.push(
                    Postgres.query(`CREATE OR REPLACE FUNCTION ${function_name}${function_text}`)
                )
            })
    }
    // Triggers generation
    if(schema.triggers){
        Object
            .keys(schema.triggers)
            .forEach(trigger_name => {
                let trigger_text = schema.triggers[trigger_name]
                if(verbose){ console.log("  > Creating trigger " + trigger_name + '...'); }
                promises.push(
                    Postgres.query(`CREATE OR REPLACE TRIGGER  ${trigger_name} ${trigger_text}`)
                )
            })
    }

    // Schema options
    if(schema.options){
        // SET TIMEZONE
        if(schema.options.default_timezone){
            promises.push(Postgres.query(`ALTER DATABASE ${database} SET timezone TO '${schema.options.default_timezone}';`))
            if(verbose){ console.log('  > Set timezone to ' + schema.options.default_timezone) }
        }
    }

    await Promise.all(promises)
    console.log("Migration completed successfully.")
    await Postgres.end()
}

_init()
.catch(console.log)
.finally(() => {
    console.log("Blueprint finished.")
    process.exit(0)
})

// Set React Client Variables
if(outputClient){
    const template_file = fs.readFileSync(path.join(__dirname, './react_database_client_template.js'))

    let client_file = template_file + '\n\nconst database =  {\n'
    Object.keys(schema.tables)
    .forEach(key => {
        client_file += `\t${key}: {
        get:  get('${key}'),
        set:  set('${key}'),
        push: push('${key}')
    },`
    })
    

    client_file += '\n}\n\nexport default database'
    

    // client = `const tables = ${client};\n\nexport default tables;`

    const outputClientDir  = path.join(__dirname, outputClient.substring(0, outputClient.lastIndexOf('/')))
    const outputClientFile = path.join(__dirname, outputClient)

    if (!fs.existsSync(outputClientDir)){
        fs.mkdirSync(outputClientDir, { recursive: true });
    }
    fs.writeFileSync(outputClientFile, client_file, 'utf8')
}