const database = require('../../Database.js');
const passwordHash = require('password-hash');

module.exports = async function(req, res){
    try {
        // Must be an authorized request
        if(!req.session || !req.session.user){ return res.sendStatus(401) }

        const { id } = req.session.user
        const { name, password } = req.body
    
        const data = {}

        if(password && password.length >= 8){
            password = passwordHash.generate(password)
            data['password'] = password
        }

        if(name){
            data['name'] = name
        }

        let user = req.session.user;
        if(Object.keys(data).length){
            user = await database.users.update({ where:{ id } })
            req.session.user = user
            await req.session.save()
        }

        res.status(200).send(user)
    } catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}