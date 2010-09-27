# Helper
puts = -> console?.log.apply console, arguments

# Elements
doc = html = wb = el = cxt = null

# Slide contents
slides = []
slideBgs = []
count = 0

# Element setup
$ ->
  doc = $ document
  html = $ document.documentElement
  wb = $ '#whiteboard'
  el = wb[0]
  cxt = el.getContext '2d'

# Section navigation
swap = null
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
    if changeSlide
      changeSlide count
      $.each $('[data-preview]'), (i) ->
        $(this)[0].getContext('2d').putImageData slides[i], 0, 0
        $(this).parent().css 'background-color', slideBgs[i]
  swappers = $('[data-section]').live 'click', -> swap $(this).attr 'data-section'

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
  header = $ '#whiteboard-header'
  focussed = false
  $('input, textarea').live 'focus', ->
    focussed = true
  .live 'blur', ->
    focussed = false
    true
  changeSlide = (slide) ->
    slides[count] = cxt.getImageData 0, 0, el.width, el.height
    count = slide
    $('[data-slide]').removeClass 'active'
    which = $("[data-slide=#{slide}]").addClass 'active'
    header.text which.text()
    el.width = el.width
    cxt.putImageData slides[slide], 0, 0
    draw.fill slideBgs[slide]
  $('[data-slide]').live 'click', move = ->
    slide = $(this).attr 'data-slide'
    c = count
    if slide is 'next' then (if c < slides.length - 2 then c += 1)
    else if slide is 'prev' then (if c > 0 then c -= 1)
    else c = slide
    changeSlide c
    send.slide c
  prev = $('[data-slide=prev]')[0]
  next = $('[data-slide=next]')[0]
  doc.keyup (evt) ->
    return if focussed
    switch evt.which
      when 37 then move.call prev
      when 39 then move.call next

# Lesson renaming
prepareNewLesson = null
$ ->
  prepareNewLesson = (slide) ->
    title = slide.children()
    input = $ "<input value='#{title.text()}'>"
    keypress = (evt) -> blur.call input[0] if evt.which is 13
    slide.click ->
      return false if input.on
      title.html input
      doc.keypress keypress
      input.focus().on = on
      false
    input.blur blur = ->
      title.text $(this).val()
      $(this).remove()
      doc.unbind 'keypress', keypress
      input.on = off
  $.each $('.slide:first-child .slide-top'), -> prepareNewLesson $(this)

# Lesson adding
$ ->
  $.each $('#courses>li'), ->
    name = $(this).attr 'data-name'
    course = $(this).find '.course'
    $(this).find('.add-lesson').click ->
      li = $ '''<li>
            <ul class="lesson">
              <li class="slide" data-section="whiteboard">
                <div class="slide-top">
                  <div class="lesson-title">New Lesson</div>
                </div>
              </li>
            </ul>
          </li>'''
      course.append li
      prepareNewLesson li.find '.slide-top'
      children = $("[href=#course-#{name}]+*>span")
      (less = children.eq 0).text parseInt(less.text(), 10) + 1
      (slid = children.eq 1).text parseInt(slid.text(), 10) + 1

# Slide adding
$ ->
  lesson = $ '#lesson ol'
  $('#add-slide').click ->
    lesson.append "<li data-slide='#{len = lesson.children().length}'>New Slide</li>"
    slides.push blank
    slideBgs.push 'white'
    changeSlide len

# Blank slides
blank = null
$ ->
  blank = cxt.getImageData 0, 0, el.width, el.height
  for i in [0..$('#lesson li').length]
    slides.push blank
    slideBgs.push 'white'

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
      slideBgs[count] = color or vars.color

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
  courses = {}
  $('.permissions label').click -> (input = $(this).prev()[0]).checked = !input.checked
  $.each $('.admin-course'), ->
    course = courses[$(this).children('.fancy-title').text()] = []
    student = null
    permissions = $(this).find('.permissions input').change ->
      student[$(this).attr 'data-permission'] = $(this).attr 'checked'
    $.each $(this).find('select'), ->
      $.each $(this).children(), ->
        course.push { 'chat', 'drawing', 'eraser' }
      student = course[0]
      $(this).change ->
        student = course[$(this).val()]
        $.each permissions, ->
          if student[$(this).attr 'data-permission'] then $(this).attr 'checked', 'checked'
          else $(this).removeAttr 'checked'

# Name editing
$ ->
  name = $ '#name'
  preferred = $('#edit-preferred-name').keyup nameFn = ->
    name.text "#{(if val = preferred.val() then val else first.val())} #{last.val()}"
  first = $('#edit-first-name').keyup nameFn
  last  = $('#edit-last-name').keyup nameFn

# Chat
announce = null
$ ->
  ul = $ '#chat ul'
  announce = (text) ->
    ul.children('.empty').remove()
    ul.append "<li><span class='chat-user'>Tim:</span> #{text}</li>"
    input.val ''
  input = $('#chat input').keydown (evt) -> if evt.which is 13
    if text = input.val()
      announce text
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
      when 'slide' then changeSlide data
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
    slide: (data) ->
      doSend 'slide', null, data
  socket.connect()

# Presentation
$ ->
  doSlide = (slide, title, text...) ->
    changeSlide slide
    vars.color = '#3DA5FF'
    draw.fill()
    vars.color = '#57FFAB'
    cxt.textAlign = 'center'
    vars.font = if title.length > 20 then 48 else 64
    draw.text 400, 50, title
    cxt.textAlign = 'left'
    vars.color = 'white'
    next = 150
    for t in text
      vars.font = 36
      if typeof t is 'string'
        draw.text 25, next, t
        next += (t.split('\n').length + 1) * vars.font
      else
        for b, i in t
          draw.text(25, next, if i is 0 then b else
            ((if j is 0 then ' - ' else '   ') + l for l, j in b.split('\n')).join '\n')
          next += (b.split('\n').length + 0.5) * vars.font
          vars.font = 24
        next += 20
  
  vars.color = '#3DA5FF'
  draw.fill()
  vars.color = '#57FFAB'
  cxt.textAlign = 'center'
  vars.font = 64
  draw.text 400, 175, 'White Space'
  vars.color = 'white'
  vars.font = 36
  draw.text 400, 300, 'by Blank Slate'
  cxt.textAlign = 'left'
  
  doSlide 1, 'Main User', 'A User who would utilize a collaborative\n
and interactive online whiteboard.', 'Someone who would benefit  from a remote\n
system of communicating information in a\nvisual way.', 'A correspondence educator seemed ideal.'
  
  doSlide 2, 'Persona', '"The Educator" is a persona built out of\n
attributes and opinions of real teachers\nwe all know.', 'But he is also more than that, as we\n
discovered while developing how he\ninteracted with the world and potentially\n
our software through scenarios.'
  
  doSlide 3, 'Scenarios', ['Teach, and teach well:', 'Drawing to get information across in a 
natural way.', 'Answering student queries and providing feedback.'], ["Don't waste time on 
administration:", 'Roll should be taken automatically.', 'He can easily enter his lesson plan.
', "If necessary, he can use another teacher's lesson so he\n
doesn't have to worry about planning."]
   
  doSlide 4, 'More Scenarios', 'Seeing upcoming lessons.', 'Communication and control.', '
Notices and announcements out of the\nway of the learning.'

  doSlide 5, 'Design Decisions: Application', 'Many levels of computer literacy.', '
Real time networking is essential.', ['Web application most suitable:', '
No worry about installations.', 'Most people at ease with browsers.', 'Ease of networking.', '
Updates and data storage easily handled at server.']
  
  doSlide 6, 'Design Decisions: Features', 'Focus on learning with minimal features.', '
Focus on the whiteboard.', "Customisable lesson templates so lessons\naren't boring for students.", '
Give teachers and students profiles for\npermissions and attendance.'
  
  doSlide 7, 'Design Decisions: Colours', 'Pale blue - soothes and calms.', 'A little green - 
inspires creativity.', 'Pale yellow - prevents irritation.', 'Bright red, orange and yellow avoided.\n
Agitates children, red incites hunger.'
  
  doSlide 8, 'What Documentation?', ['There is lack of user documentation.', 'Intuitive interface 
through universal conventions.', 'Definitely a few tasks that will require documentation\nfor first 
time users.']
  
  doSlide 9, 'Feedback & Errors', 'Some actions have no confirmation of\ntheir success.', '
No notification about success of\nserver communication.'
  
  doSlide 10, 'Other Heuristic Considerations', 'The tab metaphor for novice users.', '
No shortcuts for advanced users.'
  
  # changeSlide 0
  swap if hash = document.location.hash.substring 1 then hash else 'lessons'
  vars.color = 'black'
  vars.font = 12
  