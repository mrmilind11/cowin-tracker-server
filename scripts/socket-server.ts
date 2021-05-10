import http from 'http';
import { Server, Socket } from 'socket.io';

const clientSet = new Set();
let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://cowin-tracker-frontend.vercel.app']
        }
    });

    io.on('connect', (socket: Socket) => {
        console.log('Connected to client:', socket.id);
        clientSet.add(socket.id);
        console.log('Total clients', clientSet);
        emitToSocket('CONNECTED', { 'data': 'You are connected...' })
        socket.on('disconnect', () => {
            clientSet.delete(socket.id);
            console.log('disconnected', socket.id);
            console.log('Total clients', clientSet);
        })
    })
}

export const emitToSocket = (message: string, data: any) => {
    if (io && clientSet.size > 0) {
        console.log('Emitted');
        io.emit(message, data);
    }
}