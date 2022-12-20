import * as dotenv from 'dotenv' // Load environment file
dotenv.config()

import GenerateApp from './scripts/GenerateApp.js'

const { PORT=3000, NODE_ENV='development' } = process.env;

const app = GenerateApp()

// Serve client React.js files to all GET routes!
app.get('*', (req, res) => res.sendFile('./client/build/index.html', { root:'./' }))

app.listen(PORT, () => { console.log(`Server running in ${NODE_ENV} mode, on port ${PORT}${NODE_ENV === 'development'?' and is available at http://localhost:'+PORT:''}`) })