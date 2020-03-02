const functions = require('firebase-functions');
const express = require('express')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.get('/', (req, res) => {
    res.send('<h1>My Store (from backend) </h1>')
})

function frontendHandler(req, res) {
    // eslint-disable-next-line no-path-concat
    res.sendFile(__dirname + '/prodadmin/prodadmin.html')
}
function Converter(req, res) {
    // eslint-disable-next-line no-path-concat
    res.sendFile(__dirname + '/prodadmin/temp.html')
}

app.get('/login', frontendHandler);
app.get('/home', frontendHandler);
app.get('/add', frontendHandler);
app.get('/show', frontendHandler);