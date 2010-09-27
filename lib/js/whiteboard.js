(function() {
  var announce, changeSlide, cxt, doc, draw, editHead, el, html, icon, puts, send, slides, vars, wb;
  puts = function() {
    return (typeof console === "undefined" || console === null) ? undefined : console.log.apply(console, arguments);
  };
  doc = (html = (wb = (el = (cxt = null))));
  slides = [];
  $(function() {
    doc = $(document);
    html = $(document.documentElement);
    wb = $('#whiteboard');
    el = wb[0];
    return (cxt = el.getContext('2d'));
  });
  $(function() {
    var _i, _len, _ref, _result, elements, hash, section, sections, swap, swappers;
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
      return $("[data-section=" + (section) + "]").addClass('active');
    };
    swappers = $('[data-section]').click(function() {
      return swap($(this).attr('data-section'));
    });
    return swap((hash = document.location.hash.substring(1)) ? hash : 'lessons');
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
    var b, count, focussed, header, move, next, prev;
    count = 0;
    header = $('#whiteboard-header');
    focussed = false;
    $('input, textarea').live('focus', function() {
      return (focussed = true);
    }).live('blur', function() {
      focussed = false;
      return true;
    });
    b = $('[data-slide]').live('click', move = function() {
      var slide, which;
      slides[count] = cxt.getImageData(0, 0, el.width, el.height);
      slide = $(this).attr('data-slide');
      if (slide === 'next') {
        (function() {
          if (count < slides.length - 2) {
            return count += 1;
          }
        })();
      } else if (slide === 'prev') {
        (function() {
          if (count > 0) {
            return count -= 1;
          }
        })();
      } else {
        count = slide;
      }
      b.removeClass('active');
      which = $("[data-slide=" + (count) + "]").addClass('active');
      header.text(which.text());
      el.width = el.width;
      return cxt.putImageData(slides[count], 0, 0);
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
  $(function() {
    var _result, blank, i;
    blank = cxt.getImageData(0, 0, el.width, el.height);
    _result = [];
    for (i = 0; i <= 3; i++) {
      _result.push(slides.push(blank));
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
        return background.css({
          'background-color': color || vars.color
        });
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
    var defPer, inputs, student, students;
    defPer = {
      chat: true,
      drawing: true,
      eraser: true
    };
    students = [
      {
        first: 'Matthew',
        last: 'Bisley',
        permissions: {
          chat: true,
          drawing: true,
          eraser: true
        }
      }, {
        first: 'Carl',
        last: 'McMillan',
        permissions: {
          drawing: true
        }
      }, {
        first: 'Thomas',
        last: 'Robinson',
        permissions: {
          chat: true,
          drawing: true,
          eraser: true,
          image: true,
          background: true
        }
      }
    ];
    student = students[0];
    $('#students select').change(function() {
      student = students[$(this).val()];
      return $.each(inputs, function() {
        return student.permissions[$(this).attr('data-permission')] ? $(this).attr('checked', 'checked') : $(this).removeAttr('checked');
      });
    });
    return (inputs = $('#permissions input').change(function() {
      return (student.permissions[$(this).attr('data-permission')] = Boolean($(this).attr('checked')));
    }));
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
    ul = $('#announcements ul');
    announce = function(text) {
      ul.children('.empty').remove();
      ul.append("<li>" + (text) + "</li>");
      return input.val('');
    };
    return (input = $('#announcements input').keydown(function(evt) {
      var text;
      if (evt.which === 13) {
        announce(text = input.val());
        return send.announce(text);
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
      }
    };
    return socket.connect();
  });
}).call(this);
