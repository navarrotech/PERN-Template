const database = require('../../Database.js')

module.exports = async function(req, res){
    try {
        const { email } = req.body
    
        if(!email){
            return res.status(400).send({ message: "Email is required to check if it exists!" })
        }
    
        const user = await database.users.findUnique({ where: { email } })
    
        if(user){
            return res.status(200).send({ exists: true })
        }
        return res.status(204).send({ exists: false })

    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}