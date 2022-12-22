const database = require('../../Database.js')
const passwordHash = require('password-hash');

module.exports = async function(req, res){
    try {
        const { email, password } = req.body
    
        if(!email || !password){
            return res.status(400).send({ message: "Email and password is required in order to login!" })
        }
    
        const [ user ] = await database.query(`SELECT * FROM users WHERE email = $1`, [email])
    
        // Successful login
        if(user && user.email && passwordHash.verify(password, user.password)) {
            delete user.password
            req.session.user = user
            req.session.authorized = true
            await req.session.save()
            res.status(200).send({ user, authorized:true })
        }
        // Invalid email
        else if (user){
            res.status(401).send({ message:"User not found, did you mean to signup instead?", redirect: '/signup' })
        }
        // Invalid password
        else {
            res.status(401).send({ message:"Invalid password, please try again!" })
        }
    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}