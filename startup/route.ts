import { Express } from 'express';

const router = (app: Express) => {
    app.get('/', (req, res) => {
        res.send('Welcome to cowin tracker');
    })

    app.get('*', (req, res) => {
        res.send('Page not found!')
    })
}

export default router;