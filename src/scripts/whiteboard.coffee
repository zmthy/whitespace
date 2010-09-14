puts = -> console?.log.apply console, arguments

$ ->
  x = -1
  y = -1
  down = no
  
  html = $('html')
  canvas = $('#whiteboard')
  .mousedown (evt) ->
    offset = canvas.offset().left
    x = evt.pageX - canvas.offset().left
    y = evt.pageY
    html.addClass 'unselectable'
    down = yes
  
  $(document)
  .mousemove (evt) ->
    offset = canvas.offset().left
    if down
      context.beginPath()
      context.moveTo x, y
      context.lineTo x = evt.pageX - offset, y = evt.pageY
      context.stroke()
  .mouseup (evt) ->
    if down
      html.removeClass 'unselectable'
      down = no
  
  context = canvas[0].getContext '2d'
  context.strokeStyle = '#000'
  
  canvas[0].width  = canvas.width()
  canvas[0].height = canvas.height()