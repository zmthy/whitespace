socket = ws.createServer()

clients = []
socket.on 'connection', (client) ->
  clients.push client
  client.on 'message', (message) ->
    socket.send other.id, message for other in clients when other isnt client

socket.listen 80