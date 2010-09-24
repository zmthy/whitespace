connect = require 'connect'
express = require 'express'
socket  = require 'socket.io'

app = express.createServer()
app.use connect.staticProvider __dirname + '/lib'

app.get '/', (req, res) -> res.redirect '/whiteboard.html'

app.listen 8080

socket.listen app

socket.on 'connection', (client) ->
  puts "!"
