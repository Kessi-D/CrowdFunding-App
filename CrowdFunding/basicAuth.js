function authUser(req,res,next){
    if (req.user === undefined ){
        res.status(403)
        return res.redirect('/users/login')
    }
    next();
}

function authRole(role){
    return (req,res,next) => {

        if (req.user.role !== role){
            res.status(401)
            return res.send('Not allowed!')
        }

        next()
    }
}

module.exports = {
    authUser,
    authRole
}