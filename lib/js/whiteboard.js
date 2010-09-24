(function() {
  var backColor, doc, drawing, lineWidth, puts, slides, strokeStyle;
  puts = function() {
    return (typeof console === "undefined" || console === null) ? undefined : console.log.apply(console, arguments);
  };
  doc = $(document);
  drawing = true;
  lineWidth = 1;
  strokeStyle = 'black';
  backColor = 'white';
  slides = [];
  $(function() {
    var _a, blank, canvas, context, i;
    canvas = $('#whiteboard')[0];
    context = canvas.getContext('2d');
    blank = context.getImageData(0, 0, canvas.width, canvas.height);
    _a = [];
    for (i = 0; i <= 3; i++) {
      _a.push(slides.push(blank));
    }
    return _a;
  });
  $(function() {
    var canvas, context, down, html, x, y;
    x = -1;
    y = -1;
    down = false;
    html = $('html');
    canvas = $('#whiteboard').mousedown(function(evt) {
      var offset;
      offset = canvas.offset();
      context.lineWidth = lineWidth;
      context.strokeStyle = strokeStyle;
      context.beginPath();
      context.moveTo(x = evt.pageX - offset.left, y = evt.pageY - offset.top);
      html.addClass('unselectable');
      return (down = true);
    });
    doc.mousemove(function(evt) {
      var offset;
      if (!(drawing)) {
        return null;
      }
      offset = canvas.offset();
      if (down) {
        sendLine(x, y, x = evt.pageX - offset.left, y = evt.pageY - offset.top);
        context.lineTo(x, y);
        return context.stroke();
      }
    }).mouseup(function(evt) {
      if (down) {
        html.removeClass('unselectable');
        return (down = false);
      }
    });
    context = canvas[0].getContext('2d');
    context.strokeStyle = '#000';
    canvas[0].width = canvas.width();
    return (canvas[0].height = canvas.height());
  });
  $(function() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, a, all, canvas, context, elements, hash, i, section, sections;
    canvas = $('#whiteboard')[0];
    context = canvas.getContext('2d');
    sections = 'whiteboard lessons admin'.split(' ');
    elements = {};
    _b = sections;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      section = _b[_a];
      elements[section] = $("." + (section));
    }
    all = $((function() {
      _d = []; _f = sections;
      for (_e = 0, _g = _f.length; _e < _g; _e++) {
        section = _f[_e];
        _d.push("." + (section));
      }
      return _d;
    })().join(','));
    a = $('nav a').click(function() {
      a.removeClass('active');
      $(this).addClass('active');
      all.hide();
      slides[$('#current-slide').attr('data-slide')] = context.getImageData(0, 0, canvas.width, canvas.height);
      $.each($('.slide canvas'), function() {
        return this.getContext('2d').putImageData(slides[$(this).attr('data-slide')], 0, 0);
      });
      return elements[$(this).attr('data-click')].show();
    });
    a.eq(1).click();
    if (hash = document.location.hash.substring(1)) {
      _h = sections;
      for (i = 0, _i = _h.length; i < _i; i++) {
        section = _h[i];
        if (section === hash) {
          a.eq(i).click();
        }
      }
    }
    return $('.to-whiteboard').click(function() {
      return a.eq(0).click();
    });
  });
  $(function() {
    var adjust, context, imageLoader, img, inputContainer, textInput, types, whiteboard;
    whiteboard = $('#whiteboard');
    context = whiteboard[0].getContext('2d');
    context.font = '12pt Inconsolata, arial, sans-serif';
    context.textBaseline = 'top';
    textInput = $('#text-input').blur(function() {
      var _a, _b, i, line;
      inputContainer.hide();
      puts(textInput.val());
      _a = textInput.val().split('\n');
      for (i = 0, _b = _a.length; i < _b; i++) {
        line = _a[i];
        context.fillText(line, textInput.x, textInput.y + i * 17);
      }
      return textInput.val('').attr({
        rows: 1,
        cols: 1
      });
    }).keyup(adjust = function() {
      var _a, _b, _c, line, max, text;
      text = textInput.val();
      textInput.attr('rows', (text = text.split('\n')).length);
      max = 0;
      _b = text;
      for (_a = 0, _c = _b.length; _a < _c; _a++) {
        line = _b[_a];
        if (line.length > max) {
          max = line.length;
        }
      }
      return textInput.attr('cols', max === 0 ? 1 : max);
    }).keydown(function(evt) {
      return evt.which === 13 ? textInput.attr('rows', textInput.attr('rows') + 1) : adjust();
    });
    inputContainer = $('#whiteboard-input-container');
    imageLoader = $('#whiteboard-image-loader');
    types = {
      marker: function() {
        return (lineWidth = 5);
      },
      pencil: function() {
        return (lineWidth = 1);
      },
      eraser: function() {
        lineWidth = 20;
        return (context.globalCompositeOperation = 'destination-out');
      },
      text: function() {
        whiteboard.css('cursor', 'text');
        drawing = false;
        return whiteboard.click(function(evt) {
          var offset;
          if (drawing) {
            return null;
          }
          inputContainer.show();
          offset = inputContainer.offset();
          return textInput.focus().val('').css({
            left: (textInput.x = evt.pageX - offset.left) - 5,
            top: (textInput.y = evt.pageY - offset.top) - 5
          });
        });
      },
      image: function() {
        return imageLoader.click();
      },
      fill: function() {
        context.fillStyle = (backColor = 'green');
        context.globalCompositeOperation = 'destination-over';
        return context.fillRect(0, 0, whiteboard[0].width, whiteboard[0].height);
      }
    };
    return (img = $('#toolbar img').click(function() {
      var type;
      img.removeClass('active');
      $(this).addClass('active');
      strokeStyle = 'black';
      whiteboard.css('cursor', 'default');
      context.globalCompositeOperation = 'source-over';
      drawing = true;
      if (type = types[$(this).attr('data-type')]) {
        return type();
      }
    }));
  });
  $(function() {
    var bound, editing, header, input;
    editing = false;
    input = $('<input>');
    return (header = $('#whiteboard-header').click(bound = function() {
      var press;
      input.val(header.text());
      header.html(input);
      header.unbind('click', bound);
      input.blur(function() {
        var val;
        header.text(val = input.val());
        $('#current-slide').text(val);
        header.click(bound);
        return doc.unbind('keypress', press);
      });
      input.focus();
      return doc.keypress(press = function(evt) {
        if (evt.which === 13) {
          return input.blur();
        }
      });
    }));
  });
  $(function() {
    var canvas, context, header;
    header = $('#whiteboard-header');
    canvas = $('#whiteboard')[0];
    context = canvas.getContext('2d');
    return $('#lesson li').click(function() {
      var current;
      current = $('#current-slide').removeAttr('id');
      slides[current.attr('data-slide')] = context.getImageData(0, 0, canvas.width, canvas.height);
      $(this).attr('id', 'current-slide');
      header.text($(this).text());
      canvas.width = canvas.width;
      return context.putImageData(slides[$(this).attr('data-slide')], 0, 0);
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
  $(function() {
    var input, ul;
    ul = $('#announcements ul');
    return (input = $('#announcements input').keydown(function(evt) {
      if (evt.which === 13) {
        ul.children('.empty').remove();
        ul.append("<li>" + (input.val()) + "</li>");
        return input.val('');
      }
    }));
  });
  $(function() {
    var ws;
    ws = new WebSocket('ws://bitroar:81/');
    ws.onmessage = function(evt) {
      return puts(evt.message);
    };
    return (window.sendLine = function(x1, y1, x2, y2) {
      return socket.send("{line: [" + (x1) + ", " + (y1) + ", " + (x2) + ", " + (y2) + "]}");
    });
  });
})();
