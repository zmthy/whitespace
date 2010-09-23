connect  = require 'connect'
express  = require 'express'

app = express.createServer()
app.use connect.staticProvider __dirname + '/lib'

app.get '/', (req, res) -> res.redirect '/whiteboard.html'

app.listen 8080
