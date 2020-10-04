const Server = use('Server')
const io = use('socket.io')(Server.getInstance())
const socketioJwt  = require('socketio-jwt');
const Env = use('Env')

class CustomSocket {

    socketIds = {}

    constructor(instance) {
        this.instance = instance
        
        this.instance.sockets
        .on('connection', socketioJwt.authorize({
            secret: Env.get('APP_KEY'),
            timeout: 15000
        }))
        .on('authenticated', (socket) => {
            console.log(socket.id)
            this.socketIds[socket.decoded_token.uid] = socket.id
        })
        .on('disconnect', (socket) =>{
            delete this.socketIds[socket.decoded_token.uid]
        });
    }

    on(userId, channel, handler) {
        if (this.socketIds[userId])
        {
            return
        }
        const socket = this.instance.sockets.connected[this.socketIds[userId]]
        socket.on(channel, handler)
    }

    emitToUser(userId, channel, data) {
        if (this.socketIds[userId])
        {
            return
        }
        this.instance.to(this.socketIds[userId]).emit(channel, JSON.stringify(data))
    }
}

module.exports = new CustomSocket(io)