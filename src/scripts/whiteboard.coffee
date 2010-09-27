# Helper
puts = -> console?.log.apply console, arguments

# Elements
doc = html = wb = el = cxt = null

# Slide contents
slides = []

# Element setup
$ ->
  doc = $ document
  html = $ document.documentElement
  wb = $ '#whiteboard'
  el = wb[0]
  cxt = el.getContext '2d'

# Section navigation
$ ->
  sections = 'whiteboard lessons admin'.split ' '
  elements = {}
  for section in sections then elements[section] = $ ".#{section}"
  sections = $ (".#{section}" for section in sections).join ','
  swap = (section) ->
    return unless elements[section]
    sections.hide()
    elements[section].show()
    swappers.removeClass 'active'
    $("[data-section=#{section}]").addClass 'active'
  swappers = $('[data-section]').click -> swap $(this).attr 'data-section'
  swap if hash = document.location.hash.substring 1 then hash else 'lessons'

# Header editing
editHead = null
$ ->
  input = $ '<input>'
  editHead = (text) ->
    header.text text
    $('#lesson li.active').text text
  header = $('#whiteboard-header').click bound = ->
    input.val header.text()
    header.html input
    header.unbind 'click', bound
    input.blur ->
      editHead text = input.val()
      header.click bound
      doc.unbind 'keypress', press
      send.header text
    input.focus()
    doc.keypress press = (evt) -> input.blur() if evt.which is 13

# Slide navigation
changeSlide = null
$ ->
  count = 0
  header = $ '#whiteboard-header'
  focussed = false
  $('input, textarea').live 'focus', ->
    focussed = true
  .live 'blur', ->
    focussed = false
    true
  b = $('[data-slide]').live 'click', move = ->
    slides[count] = cxt.getImageData 0, 0, el.width, el.height
    slide = $(this).attr 'data-slide'
    if slide is 'next' then (if count < slides.length - 2 then count += 1)
    else if slide is 'prev' then (if count > 0 then count -= 1)
    else count = slide
    b.removeClass 'active'
    which = $("[data-slide=#{count}]").addClass 'active'
    header.text which.text()
    el.width = el.width
    cxt.putImageData slides[count], 0, 0
  prev = $('[data-slide=prev]')[0]
  next = $('[data-slide=next]')[0]
  doc.keyup (evt) ->
    return if focussed
    switch evt.which
      when 37 then move.call prev
      when 39 then move.call next

# Blank slides
$ ->
  blank = cxt.getImageData 0, 0, el.width, el.height
  slides.push blank for i in [0..3]

# Drawing vars
vars = 
  size: 5
  color: 'black'
  font: 12

# Drawing functions
draw = null
$ ->
  background = $ '#whiteboard-container'
  
  reset = (size, stroke, erase) ->
    cxt.lineWidth = size or vars.size
    cxt.strokeStyle = stroke or vars.color
    cxt.fillStyle = stroke or vars.color
    cxt.globalCompositeOperation = if erase then 'destination-out' else 'source-over'
    cxt.beginPath()

  drawLine = (x1, y1, x2, y2) ->
    cxt.moveTo x1, y1
    cxt.lineTo x2, y2
    cxt.stroke()

  drawText = (x, y, text, size) ->
    cxt.font = "#{font = size or vars.font}px Inconsolata, arial, sans-serif"
    cxt.textBaseline = 'top'
    for line, i in text.split '\n'
      cxt.fillText line, x, y + i * font + i * font / 12

  draw =
    pencil: (x1, y1, x2, y2, size, color) ->
      reset 1, color
      drawLine x1, y1, x2, y2
    marker: (x1, y1, x2, y2, size, color) ->
      reset size, color
      drawLine x1, y1, x2, y2
    eraser: (x1, y1, x2, y2, size, color) ->
      reset size, color, true
      drawLine x1, y1, x2, y2
    text: (x, y, text, size, color) ->
      reset null, color
      drawText x, y, text, size
    fill: (color) ->
      background.css 'background-color': color or vars.color

# Icons
icon = 'pencil'
$ ->
  tools = $('#toolbar [data-type]').click ->
    $('#extras>*').hide()
    $("#extras [data-icon=#{icon = $(this).attr 'data-type'}]").show()
    wb.css cursor: 'default'
    tools.removeClass 'active'
    $(this).addClass 'active'

# Dragging the mouse
$ ->
  movers = 'pencil marker eraser'.split ' '
  unselectable = 'unselectable'
  x = y = null
  coords = (x, y) -> [x - (o = wb.offset()).left, y - o.top]
  extras = $('#extras').find('[data-icon=eraser],[data-icon=marker]')
  .find('input').change change = ->
    extras.val vars.size = $(this).val()
  .click change
  wb.mousedown (evt) ->
    for mover in movers when mover is icon
      html.addClass unselectable
      doc.mousemove(move).mouseup(up)
      [x, y] = coords evt.pageX, evt.pageY
      break
  move = (evt) ->
    args = [ x, y, ([x, y] = coords evt.pageX, evt.pageY)... ]
    draw[icon] args...
    send.line icon, args...
  up = (evt) ->
    doc.unbind 'mousemove', move
    doc.unbind 'mouseup', up
    html.removeClass unselectable

# Text
$ ->
  cont = $ '#whiteboard-input-container'
  input = $ '#text-input'
  size = $ '#font-size input'
  $('#toolbar [data-type=text]').click ->
    wb.css cursor: 'text'
  size.change change = ->
    vars.font = font = $(this).val()
    input.css 'font-size', font + 'px'
  .click change
  wb.mousedown (evt) ->
    if icon is 'text'
      cont.show()
      offset = cont.offset()
      input.val('').focus().css
        left: (input.x = evt.pageX - offset.left) - 5
        top:  (input.y = evt.pageY - offset.top) - 5
        color: vars.color
      false
  input.blur ->
    cont.hide()
    draw.text input.x, input.y, text = input.val()
    send.text input.x, input.y, text
    input.val('').attr rows: 1, cols: 1
  .keyup adjust = ->
    text = input.val()
    input.attr 'rows', (text = text.split '\n').length
    max = 1
    for line in text when line.length > max then max = line.length
    input.attr 'cols', max
  .keydown (evt) ->
    if evt.which is 13 then input.attr 'rows', input.attr('rows') + 1
    else adjust()

# Fill
$ ->
  $('[data-type=fill]').click ->
    draw.fill()
    send.fill()

# Colour
$ -> $('.color').change -> vars.color = '#' + $(this).val()

# Students
$ ->
  defPer = chat: true, drawing: true, eraser: true
  students = [
    {
      first: 'Matthew'
      last: 'Bisley'
      permissions:
        chat: true
        drawing: true
        eraser: true
    }, {
      first: 'Carl'
      last: 'McMillan'
      permissions:
        drawing: true
    }, {
      first: 'Thomas'
      last: 'Robinson'
      permissions:
        chat: true
        drawing: true
        eraser: true
        image: true
        background: true
    }
  ]
  student = students[0]
  $('#students select').change ->
    student = students[$(this).val()]
    $.each inputs, ->
      if student.permissions[$(this).attr 'data-permission']
        $(this).attr 'checked', 'checked'
      else $(this).removeAttr 'checked'
  inputs = $('#permissions input').change ->
    student.permissions[$(this).attr 'data-permission'] = Boolean $(this).attr 'checked'

# Name editing
$ ->
  name = $ '#name'
  preferred = $('#edit-preferred-name').keyup nameFn = ->
    name.text "#{(if val = preferred.val() then val else first.val())} #{last.val()}"
  first = $('#edit-first-name').keyup nameFn
  last  = $('#edit-last-name').keyup nameFn

# Announcements
announce = null
$ ->
  ul = $ '#announcements ul'
  announce = (text) ->
    ul.children('.empty').remove()
    ul.append "<li>#{text}</li>"
    input.val ''
  input = $('#announcements input').keydown (evt) -> if evt.which is 13
    announce text = input.val()
    send.announce text

# Socket
send = null
$ ->
  socket = new io.Socket
  socket.on 'message', (message) ->
    message = JSON.parse message
    puts message
    data = message.data
    switch message.op
      when 'draw'
        if message.type of { 'pencil', 'marker', 'eraser' }
          draw[message.type] data.x1, data.y1, data.x2, data.y2, data.size, data.color
        else if message.type is 'text'
          draw.text data.x, data.y, data.text, data.size, data.color
        else if message.type is 'fill'
          draw.fill data.color
      when 'announce' then announce data
      when 'header' then editHead data
  doSend = (op, type, data) -> socket.send JSON.stringify { op, type, data }
  send =
    line: (type, x1, y1, x2, y2) ->
      doSend 'draw', type, { x1, y1, x2, y2, color: vars.color, size: vars.size }
    text: (x, y, text) ->
      doSend 'draw', 'text', { x, y, text, color: vars.color, size: vars.font }
    fill: ->
      doSend 'draw', 'fill', { color: vars.color }
    announce: (data) ->
      doSend 'announce', null, data
    header: (data) ->
      doSend 'header', null, data
  socket.connect()
