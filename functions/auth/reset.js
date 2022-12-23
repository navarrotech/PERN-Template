const database = require('../../Database.js');
const passwordHash = require('password-hash');

const moment = require('moment')

module.exports = async function(req, res){
    try {
        let { password, search="" } = req.body
    
        if(!password){
            return res.status(400).send({ message: "Password is required in order to reset your account!" })
        }

        const query = new URLSearchParams(search)
        const row = await database.forgotPasswords.findUnique({ where:{ id:query.get('i') } })

        if(!row){
            return res.status(400).send({ message: "This reset password link has expired!" })
        }

        // Has the link expired? (Link expires 1 hour after it being created...)
        if(moment(row.created).add(1, 'hour').isAfter(moment())){
            return res.status(400).send({ message: "This reset password link has expired!" })
        }

        // Password encryption
        password = passwordHash.generate(password)

        await database.users.update({ where:{ email:row.email }, data:{ password } })
        await database.forgotPasswords.delete({ where:{ id:query.get('i') } })

        res.sendStatus(200)
    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}

// Clean up expired forgot password links on server startup (In production, should be once every 24 hours)
// Forgot password links 'expire' after 1 hour
database
    .forgotPasswords
    .deleteMany({ where: { created:{ lte: moment().subtract(1, 'hour').toISOString() } } })
    .catch(console.log)