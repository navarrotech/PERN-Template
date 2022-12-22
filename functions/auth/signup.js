const database = require('../../Database.js')
const passwordHash = require('password-hash');

module.exports = async function(req, res){
    try {
        const { name, email, password } = req.body
    
        // Validation
        if(!email || !password){
            return res.status(400).send({ message: "Name, email and password is required in order to signup!" })
        }
        if(!email.includes('@')){ return res.status(400).send({ message: "Invalid email, it must include an '@' symbol" }) }
        if(!password.length < 7){ return res.status(400).send({ message: "Password must be 8 characters or longer!" }) }

        // Password encryption
        password = passwordHash.generate(password)
        
        const [ user ] = await database.query(`INSERT INTO users(name, email, password) VALUES ($1,$2,$3) RETURNING *;`, [name, email, password])
    
        if(user) {
            delete user.password
            req.session.user = user
            req.session.authorized = true
            await req.session.save()
            res.status(200).send({ user, authorized:true })
        }
    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}