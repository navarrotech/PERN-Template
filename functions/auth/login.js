const database = require('../../scripts/Database.js')

module.exports = function(req, res){
    const { email, password } = req.body

    if(!email || !password){ return res.status(400).send({ message: "Email and password is required in order to login!" }) }

    res.status(200).send({ message:"Good job" })
}