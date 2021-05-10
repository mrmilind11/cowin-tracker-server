import http from 'http';
import { Subject, Observable } from 'rxjs';
import { Server, Socket } from 'socket.io';

let io: Server;

const clientAdded = new Subject<string>();
const clientRemoved = new Subject<string>();

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://cowin-tracker-frontend.vercel.app']
        }
    });

    io.on('connect', (socket: Socket) => {
        clientAdded.next(socket.id);
        socket.on('disconnect', () => {
            clientRemoved.next(socket.id);
        })
    })
}

export const emitToSocket = (message: string, data: any, id?: string) => {
    if (id) {
        io.to(id).emit(message, data);
    } else {
        io.emit(message, data);
    }
}

export const onClientAdded = (): Observable<string> => {
    return clientAdded.asObservable();
}

export const onClientRemoved = (): Observable<string> => {
    return clientRemoved.asObservable();
}