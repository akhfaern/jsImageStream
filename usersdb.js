const jwt = require('jsonwebtoken')
const { getPersonel } = require('./personelList')

let users = [
    { "username": "mcem1", "password": "123", "token": "", "ipAddress": "" },
    { "username": "mcem2", "password": "123", "token": "", "ipAddress": "" }
]

const jwtPassword = 'secretjwtpassword'

const generateAuthToken = (username) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ "username": username }, jwtPassword, (err, token) => {
            if (err) {
                reject('')
            }
            resolve(token)
        })
    })
}

const userLogin = async (username, password, ipAddress, callback) => {
    const userIndex = users.findIndex((o) => {
        return o.username === username && o.password === password
    })

    if (userIndex > -1) {
        const token = await generateAuthToken(username)
        users[userIndex].token = token
        users[userIndex].ipAddress = ipAddress
        callback(undefined, token)
    }

    callback('Kullanıcı bulunamadı', undefined)
}

const verifyUser = (token) => {
    try {
        const decoded = jwt.verify(token, jwtPassword)
        const userIndex = users.findIndex((o) => {
            return o.username === decoded.username && o.token === token
        })
    
        return userIndex > -1
    } catch (e) {
        console.log('jwt error')
        return false
    }        
}

const getUser = (token) => {
    try {
        const decoded = jwt.verify(token, jwtPassword)
        return getPersonel(decoded.username);
    } catch (e) {
        console.log('token error')
        return ''
    }    
}

module.exports = {
    userLogin, verifyUser, getUser
}