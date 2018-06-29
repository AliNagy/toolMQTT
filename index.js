const express = require('express')
const app = express()
const path = require('path')

const port = 3000

app.use(express.static(__dirname + '/www'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'www', 'index.html'))
})

app.listen(port, listen(port))

function listen(port) { console.log('Now listening on port ' + port + '...') }