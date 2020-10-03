const Server = use('Server')
const io = use('socket.io')(Server.getInstance())

class CustomSocket {

    socket

    constructor(instance) {
        this.instance = instance
        
        this.instance.on('connect', (socket) => {
            this.socket = socket
        }) 
    }

    on(channel, handler) {
        this.socket.on(channel, handler)
    }

    emit(channel, data) {
        this.socket.emit(channel, JSON.stringify(data))
    }
}

module.exports = new CustomSocket(io)