module.exports = function(req, res){
    if(req.session && req.session.user){
        res.send({
            user: req.session.user,
            authorized: req.session.authorized
        })
    }
    res.send({ user: null, authorized: false })
}