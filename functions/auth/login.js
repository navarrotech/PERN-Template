const database = require('../../Database.js')
const passwordHash = require('password-hash');

module.exports = async function(req, res){
    try {
        const { email, password } = req.body
    
        if(!email || !password){
            return res.status(400).send({ message: "Email and password is required in order to login!" })
        }

        const user = await database.users.findUnique({ where:{ email } })
    
        // Successful login
        if(user && user.email && passwordHash.verify(password, user.password)) {
            delete user.password
            req.session.user = user
            req.session.authorized = true
            await req.session.save()
            res.status(200).send({ user, authorized:true })
        }
        // Invalid password
        else if (user){
            res.status(401).send({ message:"Invalid password, please try again!" })
        }
        // Invalid email
        else {
            res.status(404).send({ message:"A user with that email does not exist, did you mean to signup instead?" })
        }
    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}