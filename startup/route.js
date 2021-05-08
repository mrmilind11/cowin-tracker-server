module.exports = (app) => {
    app.get('/', (req, res, next) => {
        res.send('Welcome to cowin tracker');
    })

    app.get('*', (req, res, next) => {
        res.send('Page not found!')
    })
}