(function() {
  var puts;
  puts = function() {
    return (typeof console === "undefined" || console === null) ? undefined : console.log.apply(console, arguments);
  };
  $(function() {
    var canvas, context, down, html, x, y;
    x = -1;
    y = -1;
    down = false;
    html = $('html');
    canvas = $('#whiteboard').mousedown(function(evt) {
      var offset;
      offset = canvas.offset().left;
      x = evt.pageX - canvas.offset().left;
      y = evt.pageY;
      html.addClass('unselectable');
      return (down = true);
    });
    $(document).mousemove(function(evt) {
      var offset;
      offset = canvas.offset().left;
      if (down) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x = evt.pageX - offset, y = evt.pageY);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, a, all, elements, hash, i, section, sections;
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
      return elements[$(this).attr('data-click')].show();
    });
    a.eq(0).click();
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
    var img;
    return (img = $('#toolbar img').click(function() {
      img.removeClass('active');
      return $(this).addClass('active');
    }));
  });
})();
