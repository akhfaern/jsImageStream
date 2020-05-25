const {verifyUser} = require('./usersdb')

const auth = async (req, res, next) => {
    try {
        const token = req.query.token
        const verifyLogin = verifyUser(token)  
        
        if (!verifyLogin) {
            throw new Error()
        }
        req.token = token
        next()
    } catch (e) {
        res.redirect('/login.html')
    }
}

module.exports = auth