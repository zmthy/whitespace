(function() {
  var announce, blank, changeSlide, count, cxt, doc, draw, editHead, el, html, icon, prepareNewLesson, puts, send, slideBgs, slides, swap, vars, wb;
  var __slice = Array.prototype.slice;
  puts = function() {
    return (typeof console === "undefined" || console === null) ? undefined : console.log.apply(console, arguments);
  };
  doc = (html = (wb = (el = (cxt = null))));
  slides = [];
  slideBgs = [];
  count = 0;
  $(function() {
    doc = $(document);
    html = $(document.documentElement);
    wb = $('#whiteboard');
    el = wb[0];
    return (cxt = el.getContext('2d'));
  });
  swap = null;
  $(function() {
    var _i, _len, _ref, _result, elements, section, sections, swappers;
    sections = 'whiteboard lessons admin'.split(' ');
    elements = {};
    _ref = sections;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      section = _ref[_i];
      elements[section] = $("." + (section));
    }
    sections = $((function() {
      _result = []; _ref = sections;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        section = _ref[_i];
        _result.push("." + (section));
      }
      return _result;
    })().join(','));
    swap = function(section) {
      if (!(elements[section])) {
        return null;
      }
      sections.hide();
      elements[section].show();
      swappers.removeClass('active');
      $("[data-section=" + (section) + "]").addClass('active');
      if (changeSlide) {
        changeSlide(count);
        return $.each($('[data-preview]'), function(i) {
          $(this)[0].getContext('2d').putImageData(slides[i], 0, 0);
          return $(this).parent().css('background-color', slideBgs[i]);
        });
      }
    };
    return (swappers = $('[data-section]').live('click', function() {
      return swap($(this).attr('data-section'));
    }));
  });
  editHead = null;
  $(function() {
    var bound, header, input;
    input = $('<input>');
    editHead = function(text) {
      header.text(text);
      return $('#lesson li.active').text(text);
    };
    return (header = $('#whiteboard-header').click(bound = function() {
      var press;
      input.val(header.text());
      header.html(input);
      header.unbind('click', bound);
      input.blur(function() {
        var text;
        editHead(text = input.val());
        header.click(bound);
        doc.unbind('keypress', press);
        return send.header(text);
      });
      input.focus();
      return doc.keypress(press = function(evt) {
        return evt.which === 13 ? input.blur() : null;
      });
    }));
  });
  changeSlide = null;
  $(function() {
    var focussed, header, move, next, prev;
    header = $('#whiteboard-header');
    focussed = false;
    $('input, textarea').live('focus', function() {
      return (focussed = true);
    }).live('blur', function() {
      focussed = false;
      return true;
    });
    changeSlide = function(slide) {
      var which;
      slides[count] = cxt.getImageData(0, 0, el.width, el.height);
      count = slide;
      $('[data-slide]').removeClass('active');
      which = $("[data-slide=" + (slide) + "]").addClass('active');
      header.text(which.text());
      el.width = el.width;
      cxt.putImageData(slides[slide], 0, 0);
      return draw.fill(slideBgs[slide]);
    };
    $('[data-slide]').live('click', move = function() {
      var c, slide;
      slide = $(this).attr('data-slide');
      c = count;
      if (slide === 'next') {
        (function() {
          if (c < slides.length - 2) {
            return c += 1;
          }
        })();
      } else if (slide === 'prev') {
        (function() {
          if (c > 0) {
            return c -= 1;
          }
        })();
      } else {
        c = slide;
      }
      changeSlide(c);
      return send.slide(c);
    });
    prev = $('[data-slide=prev]')[0];
    next = $('[data-slide=next]')[0];
    return doc.keyup(function(evt) {
      if (focussed) {
        return null;
      }
      switch (evt.which) {
        case 37:
          return move.call(prev);
        case 39:
          return move.call(next);
      }
    });
  });
  prepareNewLesson = null;
  $(function() {
    prepareNewLesson = function(slide) {
      var blur, input, keypress, title;
      title = slide.children();
      input = $("<input value='" + (title.text()) + "'>");
      keypress = function(evt) {
        return evt.which === 13 ? blur.call(input[0]) : null;
      };
      slide.click(function() {
        if (input.on) {
          return false;
        }
        title.html(input);
        doc.keypress(keypress);
        input.focus().on = true;
        return false;
      });
      return input.blur(blur = function() {
        title.text($(this).val());
        $(this).remove();
        doc.unbind('keypress', keypress);
        return (input.on = false);
      });
    };
    return $.each($('.slide:first-child .slide-top'), function() {
      return prepareNewLesson($(this));
    });
  });
  $(function() {
    return $.each($('#courses>li'), function() {
      var course, name;
      name = $(this).attr('data-name');
      course = $(this).find('.course');
      return $(this).find('.add-lesson').click(function() {
        var children, less, li, slid;
        li = $('<li>\n  <ul class="lesson">\n    <li class="slide" data-section="whiteboard">\n      <div class="slide-top">\n        <div class="lesson-title">New Lesson</div>\n      </div>\n    </li>\n  </ul>\n</li>');
        course.append(li);
        prepareNewLesson(li.find('.slide-top'));
        children = $("[href=#course-" + (name) + "]+*>span");
        (less = children.eq(0)).text(parseInt(less.text(), 10) + 1);
        return (slid = children.eq(1)).text(parseInt(slid.text(), 10) + 1);
      });
    });
  });
  $(function() {
    var lesson;
    lesson = $('#lesson ol');
    return $('#add-slide').click(function() {
      var len;
      lesson.append("<li data-slide='" + (len = lesson.children().length) + "'>New Slide</li>");
      slides.push(blank);
      slideBgs.push('white');
      return changeSlide(len);
    });
  });
  blank = null;
  $(function() {
    var _ref, _result, i;
    blank = cxt.getImageData(0, 0, el.width, el.height);
    _result = []; _ref = $('#lesson li').length;
    for (i = 0; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      _result.push((function() {
        slides.push(blank);
        return slideBgs.push('white');
      })());
    }
    return _result;
  });
  vars = {
    size: 5,
    color: 'black',
    font: 12
  };
  draw = null;
  $(function() {
    var background, drawLine, drawText, reset;
    background = $('#whiteboard-container');
    reset = function(size, stroke, erase) {
      cxt.lineWidth = size || vars.size;
      cxt.strokeStyle = stroke || vars.color;
      cxt.fillStyle = stroke || vars.color;
      cxt.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
      return cxt.beginPath();
    };
    drawLine = function(x1, y1, x2, y2) {
      cxt.moveTo(x1, y1);
      cxt.lineTo(x2, y2);
      return cxt.stroke();
    };
    drawText = function(x, y, text, size) {
      var _len, _ref, _result, font, i, line;
      cxt.font = ("" + (font = size || vars.font) + "px Inconsolata, arial, sans-serif");
      cxt.textBaseline = 'top';
      _result = []; _ref = text.split('\n');
      for (i = 0, _len = _ref.length; i < _len; i++) {
        line = _ref[i];
        _result.push(cxt.fillText(line, x, y + i * font + i * font / 12));
      }
      return _result;
    };
    return (draw = {
      pencil: function(x1, y1, x2, y2, size, color) {
        reset(1, color);
        return drawLine(x1, y1, x2, y2);
      },
      marker: function(x1, y1, x2, y2, size, color) {
        reset(size, color);
        return drawLine(x1, y1, x2, y2);
      },
      eraser: function(x1, y1, x2, y2, size, color) {
        reset(size, color, true);
        return drawLine(x1, y1, x2, y2);
      },
      text: function(x, y, text, size, color) {
        reset(null, color);
        return drawText(x, y, text, size);
      },
      fill: function(color) {
        background.css({
          'background-color': color || vars.color
        });
        return (slideBgs[count] = color || vars.color);
      }
    });
  });
  icon = 'pencil';
  $(function() {
    var tools;
    return (tools = $('#toolbar [data-type]').click(function() {
      $('#extras>*').hide();
      $("#extras [data-icon=" + (icon = $(this).attr('data-type')) + "]").show();
      wb.css({
        cursor: 'default'
      });
      tools.removeClass('active');
      return $(this).addClass('active');
    }));
  });
  $(function() {
    var change, coords, extras, move, movers, unselectable, up, x, y;
    movers = 'pencil marker eraser'.split(' ');
    unselectable = 'unselectable';
    x = (y = null);
    coords = function(x, y) {
      var o;
      return [x - (o = wb.offset()).left, y - o.top];
    };
    extras = $('#extras').find('[data-icon=eraser],[data-icon=marker]').find('input').change(change = function() {
      return extras.val(vars.size = $(this).val());
    }).click(change);
    wb.mousedown(function(evt) {
      var _i, _len, _ref, _ref2, _result, mover;
      _result = []; _ref = movers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mover = _ref[_i];
        if (mover === icon) {
          html.addClass(unselectable);
          doc.mousemove(move).mouseup(up);
          _ref2 = coords(evt.pageX, evt.pageY);
          x = _ref2[0];
          y = _ref2[1];
          break;
        }
      }
      return _result;
    });
    move = function(evt) {
      var _ref, args;
      args = [x, y].concat((function() {
          _ref = coords(evt.pageX, evt.pageY);
          x = _ref[0];
          y = _ref[1];
          return [x, y];
        })());
      draw[icon].apply(draw, args);
      return send.line.apply(send, [icon].concat(args));
    };
    return (up = function(evt) {
      doc.unbind('mousemove', move);
      doc.unbind('mouseup', up);
      return html.removeClass(unselectable);
    });
  });
  $(function() {
    var adjust, change, cont, input, size;
    cont = $('#whiteboard-input-container');
    input = $('#text-input');
    size = $('#font-size input');
    $('#toolbar [data-type=text]').click(function() {
      return wb.css({
        cursor: 'text'
      });
    });
    size.change(change = function() {
      var font;
      vars.font = (font = $(this).val());
      return input.css('font-size', font + 'px');
    }).click(change);
    wb.mousedown(function(evt) {
      var offset;
      if (icon === 'text') {
        cont.show();
        offset = cont.offset();
        input.val('').focus().css({
          left: (input.x = evt.pageX - offset.left) - 5,
          top: (input.y = evt.pageY - offset.top) - 5,
          color: vars.color
        });
        return false;
      }
    });
    return input.blur(function() {
      var text;
      cont.hide();
      draw.text(input.x, input.y, text = input.val());
      send.text(input.x, input.y, text);
      return input.val('').attr({
        rows: 1,
        cols: 1
      });
    }).keyup(adjust = function() {
      var _i, _len, _ref, line, max, text;
      text = input.val();
      input.attr('rows', (text = text.split('\n')).length);
      max = 1;
      _ref = text;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.length > max) {
          max = line.length;
        }
      }
      return input.attr('cols', max);
    }).keydown(function(evt) {
      return evt.which === 13 ? input.attr('rows', input.attr('rows') + 1) : adjust();
    });
  });
  $(function() {
    return $('[data-type=fill]').click(function() {
      draw.fill();
      return send.fill();
    });
  });
  $(function() {
    return $('.color').change(function() {
      return (vars.color = '#' + $(this).val());
    });
  });
  $(function() {
    var courses, defPer;
    defPer = {
      chat: true,
      drawing: true,
      eraser: true
    };
    courses = {};
    $('.permissions label').click(function() {
      var input;
      return ((input = $(this).prev()[0]).checked = !input.checked);
    });
    return $.each($('.admin-course'), function() {
      var course, permissions, student;
      course = (courses[$(this).children('.fancy-title').text()] = []);
      student = null;
      permissions = $(this).find('.permissions input').change(function() {
        return (student[$(this).attr('data-permission')] = $(this).attr('checked'));
      });
      return $.each($(this).find('select'), function() {
        $.each($(this).children(), function() {
          return course.push({
            'chat': 'chat',
            'drawing': 'drawing',
            'eraser': 'eraser'
          });
        });
        student = course[0];
        return $(this).change(function() {
          student = course[$(this).val()];
          return $.each(permissions, function() {
            return student[$(this).attr('data-permission')] ? $(this).attr('checked', 'checked') : $(this).removeAttr('checked');
          });
        });
      });
    });
  });
  $(function() {
    var first, last, name, nameFn, preferred;
    name = $('#name');
    preferred = $('#edit-preferred-name').keyup(nameFn = function() {
      var val;
      return name.text("" + ((val = preferred.val()) ? val : first.val()) + " " + (last.val()));
    });
    first = $('#edit-first-name').keyup(nameFn);
    return (last = $('#edit-last-name').keyup(nameFn));
  });
  announce = null;
  $(function() {
    var input, ul;
    ul = $('#chat ul');
    announce = function(text) {
      ul.children('.empty').remove();
      ul.append("<li><span class='chat-user'>Tim:</span> " + (text) + "</li>");
      return input.val('');
    };
    return (input = $('#chat input').keydown(function(evt) {
      var text;
      if (evt.which === 13) {
        if (text = input.val()) {
          announce(text);
          return send.announce(text);
        }
      }
    }));
  });
  send = null;
  $(function() {
    var doSend, socket;
    socket = new io.Socket();
    socket.on('message', function(message) {
      var data;
      message = JSON.parse(message);
      puts(message);
      data = message.data;
      switch (message.op) {
        case 'draw':
          return message.type in {
            'pencil': 'pencil',
            'marker': 'marker',
            'eraser': 'eraser'
          } ? draw[message.type](data.x1, data.y1, data.x2, data.y2, data.size, data.color) : (message.type === 'text' ? draw.text(data.x, data.y, data.text, data.size, data.color) : (message.type === 'fill' ? draw.fill(data.color) : null));
        case 'announce':
          return announce(data);
        case 'header':
          return editHead(data);
        case 'slide':
          return changeSlide(data);
      }
    });
    doSend = function(op, type, data) {
      return socket.send(JSON.stringify({
        op: op,
        type: type,
        data: data
      }));
    };
    send = {
      line: function(type, x1, y1, x2, y2) {
        return doSend('draw', type, {
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          color: vars.color,
          size: vars.size
        });
      },
      text: function(x, y, text) {
        return doSend('draw', 'text', {
          x: x,
          y: y,
          text: text,
          color: vars.color,
          size: vars.font
        });
      },
      fill: function() {
        return doSend('draw', 'fill', {
          color: vars.color
        });
      },
      announce: function(data) {
        return doSend('announce', null, data);
      },
      header: function(data) {
        return doSend('header', null, data);
      },
      slide: function(data) {
        return doSend('slide', null, data);
      }
    };
    return socket.connect();
  });
  $(function() {
    var doSlide, hash;
    doSlide = function(slide, title) {
      var _i, _len, _len2, _len3, _ref, _ref2, _ref3, _result, _result2, b, i, j, l, next, t, text;
      text = __slice.call(arguments, 2);
      changeSlide(slide);
      vars.color = '#3DA5FF';
      draw.fill();
      vars.color = '#57FFAB';
      cxt.textAlign = 'center';
      vars.font = title.length > 20 ? 48 : 64;
      draw.text(400, 50, title);
      cxt.textAlign = 'left';
      vars.color = 'white';
      next = 150;
      _result = []; _ref = text;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        _result.push((function() {
          vars.font = 36;
          if (typeof t === 'string') {
            draw.text(25, next, t);
            return next += (t.split('\n').length + 1) * vars.font;
          } else {
            _ref2 = t;
            for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
              b = _ref2[i];
              draw.text(25, next, i === 0 ? b : (function() {
                _result2 = []; _ref3 = b.split('\n');
                for (j = 0, _len3 = _ref3.length; j < _len3; j++) {
                  l = _ref3[j];
                  _result2.push((j === 0 ? ' - ' : '   ') + l);
                }
                return _result2;
              })().join('\n'));
              next += (b.split('\n').length + 0.5) * vars.font;
              vars.font = 24;
            }
            return next += 20;
          }
        })());
      }
      return _result;
    };
    vars.color = '#3DA5FF';
    draw.fill();
    vars.color = '#57FFAB';
    cxt.textAlign = 'center';
    vars.font = 64;
    draw.text(400, 175, 'White Space');
    vars.color = 'white';
    vars.font = 36;
    draw.text(400, 300, 'by Blank Slate');
    cxt.textAlign = 'left';
    doSlide(1, 'Main User', 'A User who would utilize a collaborative\n\
and interactive online whiteboard.', 'Someone who would benefit  from a remote\n\
system of communicating information in a\nvisual way.', 'A correspondence educator seemed ideal.');
    doSlide(2, 'Persona', '"The Educator" is a persona built out of\n\
attributes and opinions of real teachers\nwe all know.', 'But he is also more than that, as we\n\
discovered while developing how he\ninteracted with the world and potentially\n\
our software through scenarios.');
    doSlide(3, 'Scenarios', [
      'Teach, and teach well:', 'Drawing to get information across in a \
natural way.', 'Answering student queries and providing feedback.'
    ], [
      "Don't waste time on administration:", 'Roll should be taken automatically.', 'He can easily enter his lesson plan.\
', "If necessary, he can use another teacher's lesson so he\ndoesn't have to worry about planning."
    ]);
    doSlide(4, 'More Scenarios', 'Seeing upcoming lessons.', 'Communication and control.', '\
Notices and announcements out of the\nway of the learning.');
    doSlide(5, 'Design Decisions: Application', 'Many levels of computer literacy.', '\
Real time networking is essential.', [
      'Web application most suitable:', '\
No worry about installations.', 'Most people at ease with browsers.', 'Ease of networking.', '\
Updates and data storage easily handled at server.'
    ]);
    doSlide(6, 'Design Decisions: Features', 'Focus on learning with minimal features.', '\
Focus on the whiteboard.', "Customisable lesson templates so lessons\naren't boring for students.", '\
Give teachers and students profiles for\npermissions and attendance.');
    doSlide(7, 'Design Decisions: Colours', 'Pale blue - soothes and calms.', 'A little green - \
inspires creativity.', 'Pale yellow - prevents irritation.', 'Bright red, orange and yellow avoided.\n\
Agitates children, red incites hunger.');
    doSlide(8, 'What Documentation?', [
      'There is lack of user documentation.', 'Intuitive interface \
through universal conventions.', 'Definitely a few tasks that will require documentation\nfor first \
time users.'
    ]);
    doSlide(9, 'Feedback & Errors', 'Some actions have no confirmation of\ntheir success.', '\
No notification about success of\nserver communication.');
    doSlide(10, 'Other Heuristic Considerations', 'The tab metaphor for novice users.', '\
No shortcuts for advanced users.');
    swap((hash = document.location.hash.substring(1)) ? hash : 'lessons');
    vars.color = 'black';
    return (vars.font = 12);
  });
}).call(this);
