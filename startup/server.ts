import http from 'http';
import { Express } from 'express'

const server = (app: Express) => {
    const port = process.env.PORT || 5000;
    const server = http.createServer(app);
    server.listen(port, () => {
        console.log(`Listening to port ${port}...`)
    })
}

export default server;