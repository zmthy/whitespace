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
})();
