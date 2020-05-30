const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const hbs = require('hbs')
const io = require('socket.io')(3000)
const auth = require('./auth')
const {
    userLogin,
    getUser,
    verifyUser
} = require('./usersdb')
const ipfix = require('./ipfix')

const app = express()
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './templates/views')

const httpPort = 8080
const options = {
    inflate: true,
    limit: '2048kb',
    type: '*/*'
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.raw(options))

app.use(express.static(publicDirectoryPath))
app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.listen(httpPort)

app.get('/', auth, (req, res) => {
    res.redirect('/client.html')
})

app.post('/login', async (req, res) => {
    const ipAddress = ipfix.fixIp(req.connection.remoteAddress)
    const username = req.body.sicil
    const password = req.body.password

    try {
        userLogin(username, password, ipAddress, (err, token) => {
            if (err) {
                throw new Error()
            }
            res.send({
                token
            })
        })        
    } catch (e) {
        res.send({
            username,
            password
        })
    }
})

let images = {}
let viewerSockets = []
let clients = []

const sendImages = () => {
    setTimeout(() => {        
        viewerSockets.forEach(v => {
            v.socket.emit('stream', images)
        })
        sendImages()
    }, 200);
}

sendImages()

io.on('connection', (socket) => {

    let ipAddress = ipfix.fixIp(socket.request.connection.remoteAddress)
    let port = socket.request.connection.remotePort

    console.log('İstemci bağlandı', ipAddress + ':' + port)

    socket.emit('need register')

    socket.on('register', (data) => {
        if (verifyUser(data.token)) {
            switch (data.role) {
                case 'viewer':
                    viewerSockets.push({
                        "name": getUser(data.token),
                        "socket": socket
                    })
                    console.log('viwer connected')
                    break
                case 'client':
                    clients.push({
                        "name": getUser(data.token),
                        "socket": socket
                    })
                    console.log('client connected', ipAddress, port)
                    break
            }
            socket.emit('registerResult', {
                result: true
            })
        } else {
            socket.emit('registerResult', {
                result: false
            })
            console.log('token not verified')
        }
    })

    socket.on('getClients', () => {
        let list = []
        clients.forEach(e => {
            let ip = ipfix.fixIp(e.socket.request.connection.remoteAddress)
            list.push({
                "name": e.name,
                "remoteAddress": ip,
                "remotePort": e.socket.request.connection.remotePort
            })
        })
        viewerSockets.forEach(v => {
            console.log('sending to:', v.socket.request.connection.remoteAddress)
            v.socket.emit('clientList', list)
        })
    })


    socket.on('image', (data) => {
        images[ipAddress] = data
    })

    socket.on('lowres', (data) => {
        data = (data === '127.0.0.1') ? '::1' : '::ffff:' + data
        const clientIndex = clients.findIndex((c) => {
            return c.socket.request.connection.remoteAddress === data
        })
        if (clientIndex > -1) {
            clients[clientIndex].socket.emit('lowres')
        }
    })

    socket.on('highres', (data) => {
        data = (data === '127.0.0.1') ? '::1' : '::ffff:' + data
        const clientIndex = clients.findIndex((c) => {
            return c.socket.request.connection.remoteAddress === data
        })
        if (clientIndex > -1) {
            clients[clientIndex].socket.emit('highres')
        }
    })

    socket.on('disconnect', () => {
        const clientIndex = clients.findIndex((c) => {
            return c.socket.request.connection.remoteAddress === socket.request.connection.remoteAddress && c.socket.request.connection.remotePort === socket.request.connection.remotePort
        })
        if (clientIndex > -1) {
            clients.splice(clientIndex, 1)
            if (ipAddress in images) {
                delete images[ipAddress]
            }
            console.log("client disconnected", ipAddress, port)
        } else {
            const clientIndex = viewerSockets.findIndex((c) => {
                return c.socket.request.connection.remoteAddress === socket.request.connection.remoteAddress && c.socket.request.connection.remotePort === socket.request.connection.remotePort
            })
            if (clientIndex > -1) {
                viewerSockets.splice(clientIndex, 1)
                console.log("viewer disconnected")
            }
        }
    })

})