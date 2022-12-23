module.exports = async function(req, res){
    try{ await req.session.destroy() } catch(e){  }
    res.sendStatus(200)
}