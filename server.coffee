connect = require 'connect'
express = require 'express'
io = require 'socket.io'

app = express.createServer()
app.use connect.staticProvider __dirname + '/lib'

app.get '/', (req, res) -> res.redirect '/whiteboard.html'

socket = io.listen app

socket.on 'connection', (client) ->
  puts "!"

app.listen 8080
