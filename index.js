require('dotenv').config() // Load environment file

const GenerateApp = require('./scripts/GenerateApp.js')
const ServeFunctions = require('./scripts/Functions.js')

const { PORT=8080, NODE_ENV='development' } = process.env;

const app = GenerateApp()

// Serve client React.js files to all GET routes!
app.get('*', (req, res) => res.sendFile('./client/build/index.html', { root:'./' }))

ServeFunctions(app)

app.listen(PORT, () => {
    console.log(`Server running in ${NODE_ENV} mode, on port ${PORT}${NODE_ENV === 'development'?' and is available at http://localhost:'+PORT:''}`)
})