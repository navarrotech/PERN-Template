module.exports = async function(req, res){
    await req.session.destroy()
    res.sendStatus(200)
}