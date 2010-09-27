connect = require 'connect'
express = require 'express'
io = require 'socket.io'

app = express.createServer()
app.use connect.staticProvider __dirname + '/lib'

socket = io.listen app

socket.on 'connection', (client) ->
  client.on 'message', (message) -> client.broadcast message

app.listen 80
