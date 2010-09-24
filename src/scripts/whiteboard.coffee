puts = -> console?.log.apply console, arguments
doc = $ document
drawing = true
lineWidth = 1
strokeStyle = 'black'
backColor = 'white'

slides = []
$ ->
  canvas = $('#whiteboard')[0]
  context = canvas.getContext '2d'
  blank = context.getImageData 0, 0, canvas.width, canvas.height
  slides.push blank for i in [0..3]

$ ->
  x = -1
  y = -1
  down = no
  
  html = $('html')
  canvas = $('#whiteboard')
  .mousedown (evt) ->
    offset = canvas.offset()
    context.lineWidth = lineWidth
    context.strokeStyle = strokeStyle
    context.beginPath()
    context.moveTo x = evt.pageX - offset.left, y = evt.pageY - offset.top
    html.addClass 'unselectable'
    down = yes
  
  doc.mousemove (evt) ->
    return unless drawing
    offset = canvas.offset()
    if down
      sendLine x, y, x = evt.pageX - offset.left, y = evt.pageY - offset.top
      context.lineTo x, y 
      context.stroke()
      
  .mouseup (evt) ->
    if down
      html.removeClass 'unselectable'
      down = no
  
  context = canvas[0].getContext '2d'
  context.strokeStyle = '#000'
  
  canvas[0].width  = canvas.width()
  canvas[0].height = canvas.height()

$ ->
  canvas   = $('#whiteboard')[0]
  context  = canvas.getContext '2d'
  sections = 'whiteboard lessons admin'.split ' '
  elements = {}
  for section in sections then elements[section] = $ ".#{section}"
  all = $ (".#{section}" for section in sections).join ','
  a = $('nav a').click ->
    a.removeClass 'active'
    $(this).addClass 'active'
    all.hide()
    slides[$('#current-slide').attr 'data-slide'] =
        context.getImageData 0, 0, canvas.width, canvas.height
    $.each $('.slide canvas'), ->
      this.getContext('2d').putImageData slides[$(this).attr 'data-slide'], 0, 0
    elements[$(this).attr 'data-click'].show()
  a.eq(1).click()
  if hash = document.location.hash.substring 1
    a.eq(i).click() for section, i in sections when section is hash
  $('.to-whiteboard').click -> a.eq(0).click()

$ ->
  whiteboard = $ '#whiteboard'
  context = whiteboard[0].getContext '2d'
  context.font = '12pt Inconsolata, arial, sans-serif'
  context.textBaseline = 'top'
  
  textInput = $('#text-input')
  .blur ->
    inputContainer.hide()
    puts textInput.val()
    for line, i in textInput.val().split '\n'
      context.fillText line, textInput.x, textInput.y + i * 17
    textInput.val('').attr
      rows: 1
      cols: 1
  .keyup adjust = ->
    text = textInput.val()
    textInput.attr 'rows', (text = text.split('\n')).length
    max = 0
    for line in text
      if line.length > max then max = line.length
    textInput.attr 'cols', if max is 0 then 1 else max
  .keydown (evt) ->
    if evt.which is 13
      textInput.attr 'rows', textInput.attr('rows') + 1
    else adjust()
  
  inputContainer = $ '#whiteboard-input-container'
  imageLoader = $ '#whiteboard-image-loader'
  
  types =
    marker: -> lineWidth = 5
    pencil: -> lineWidth = 1
    eraser: ->
      lineWidth = 20
      context.globalCompositeOperation = 'destination-out'
    text: ->
      whiteboard.css 'cursor', 'text'
      drawing = false
      whiteboard.click (evt) ->
        return if drawing
        inputContainer.show()
        offset = inputContainer.offset()
        textInput.focus().val('').css
          left: (textInput.x = evt.pageX - offset.left) - 5
          top:  (textInput.y = evt.pageY - offset.top) - 5
    image: -> imageLoader.click()
    fill: ->
      context.fillStyle = backColor = 'green'
      context.globalCompositeOperation = 'destination-over'
      context.fillRect 0, 0, whiteboard[0].width, whiteboard[0].height
  
  img = $('#toolbar img').click ->
    img.removeClass 'active'
    $(this).addClass 'active'
    strokeStyle = 'black'
    whiteboard.css 'cursor', 'default'
    context.globalCompositeOperation = 'source-over'
    drawing = true
    type() if type = types[$(this).attr 'data-type']

$ ->
  editing = false
  input = $ '<input>'
  header = $('#whiteboard-header').click bound = ->
    input.val header.text()
    header.html input
    header.unbind 'click', bound
    input.blur ->
      header.text val = input.val()
      $('#current-slide').text val
      header.click bound
      doc.unbind 'keypress', press
    input.focus()
    doc.keypress press = (evt) -> input.blur() if evt.which is 13

$ ->
  header = $('#whiteboard-header')
  canvas = $('#whiteboard')[0]
  context = canvas.getContext('2d')
  $('#lesson li').click ->
    current = $('#current-slide').removeAttr 'id'
    slides[current.attr 'data-slide'] = context.getImageData 0, 0, canvas.width, canvas.height
    $(this).attr 'id', 'current-slide'
    header.text $(this).text()
    canvas.width = canvas.width
    context.putImageData slides[$(this).attr 'data-slide'], 0, 0

$ ->
  name = $ '#name'
  preferred = $('#edit-preferred-name').keyup nameFn = ->
    name.text "#{(if val = preferred.val() then val else first.val())} #{last.val()}"
  first = $('#edit-first-name').keyup nameFn
  last  = $('#edit-last-name').keyup nameFn

$ ->
  ul = $ '#announcements ul'
  input = $('#announcements input').keydown (evt) -> if evt.which is 13
    ul.children('.empty').remove()
    ul.append "<li>#{input.val()}</li>"
    input.val ''

$ ->
  ws = new WebSocket 'ws://bitroar:143/'
  ws.onmessage = (evt) -> puts evt.message
  window.sendLine = (x1, y1, x2, y2) -> ws.send "{line: [#{x1}, #{y1}, #{x2}, #{y2}]}"