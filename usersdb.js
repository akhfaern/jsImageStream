const jwt = require('jsonwebtoken')
const { getPersonel } = require('./personelList')

let users = [
    { "username": "282830", "password": "cem123", "token": "", "ipAddress": "" },
    { "username": "282831", "password": "cem123", "token": "", "ipAddress": "" }
]

const jwtPassword = 'kom282830++'

const generateAuthToken = async function (username) {
    const token = jwt.sign({ "username": username }, jwtPassword)
    return token
}

const userLogin = async (username, password, ipAddress) => {
    const userIndex = users.findIndex((o) => {
        return o.username === username && o.password === password
    })

    if (userIndex > -1) {
        const token = await generateAuthToken(username)
        users[userIndex].token = token
        users[userIndex].ipAddress = ipAddress
        return token
    }

    return ''
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
    const decoded = jwt.verify(token, jwtPassword)
    return getPersonel(decoded.username);
}

module.exports = {
    userLogin, verifyUser, getUser
}