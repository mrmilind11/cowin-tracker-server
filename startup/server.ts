import http from 'http';
import { Express } from 'express'

const serverInit = (app: Express): http.Server => {
    const port = process.env.PORT || 9000;
    const server = http.createServer(app);
    server.listen(port, () => {
        console.log(`Listening to port ${port}...`)
    })
    return server;
}

export default serverInit;