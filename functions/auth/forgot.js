const database = require('../../Database.js')

module.exports = async function(req, res){
    try {
        const { email } = req.body
    
        if(!email){
            return res.status(400).send({ message: "Email is required in order to request a forgot password link!" })
        }

        const user = await database.users.findUnique({ where:{ email } })
        
        if(user){
            const { id } = await database.forgotPasswords.create({ data: { email } })
            const reset_url = (process.env.DOMAIN||'') + "/forgot/reset?i=" + id

            // Put your email provider in here!
            console.log("Password reset request has been received, but there is no email provider to handle the request! Password reset link: " + reset_url)

            return res.status(200).send({ success: true })
        }
        res.status(404).send({ success: false })

    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}