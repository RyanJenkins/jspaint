
// make jQuery play well with PEP
$.event.props.push("button", "buttons", "clientX", "clientY", "offsetX", "offsetY", "pageX", "pageY", "screenX", "screenY", "toElement");
$.event.props.push("pointerType", "pointerId", "width", "height", "pressure", "tiltX", "tiltY", "hwTimestamp", "isPrimary");

// configure Font Detective
FontDetective.swf = "./lib/FontList.swf";


var TAU =     //////|//////
          /////     |     /////
       ///         tau         ///
     ///     ...--> | <--...     ///
   ///     -'   one | turn  '-     ///
  //     .'         |         '.     //
 //     /           |           \     //
//     |            | <-..       |     //
//    |          .->|     \       |    //
//    |         /   |      |      |    //
- - - - - - Math.PI + Math.PI - - - - - 0
//    |         \   |      |      |    //
//    |          '->|     /       |    //
//     |            | <-''       |     //
 //     \           |           /     //
  //     '.         |         .'     //
   ///     -.       |       .-     ///
     ///     '''----|----'''     ///
       ///          |          ///
         //////     |     /////
              //////|//////          C/r;

var $G = $(window);

;(function() {
  function updateCursor() {
    var cursor = selected_tool.cursor;
    var cursorLoaded = $.Deferred();

    if (typeof cursor === 'function') {
      cursorLoaded = cursor();
    } else if (typeof cursor === 'string') {
      // Cursor prop already specified
      cursorLoaded.resolve(cursor);
    } else {
      cursorLoaded.resolve(Cursor(cursor));
    }

    cursorLoaded.done(function(cursorString) {
      console.log('Setting:', cursorString);
      $canvas.css('cursor', cursorString);
    });
  }

  $G.on('tool-changed', updateCursor);
  $G.on('option-changed', updateCursor);
})();

function Cursor(cursor_def){
	return "url(images/cursors/" + cursor_def[0] + ".png) " +
		cursor_def[1].join(" ") +
		", " + cursor_def[2];
}

function paintSlash(size, color, base, direction) {
  direction = direction ? direction : 1;

  var w = base.width;
  var h = base.height;
  var id = base.ctx.getImageData(0, 0, w, h);
  var cx = ~~(w / 2);
  var cy = ~~(h / 2);
  var i, dx, dy;

  for (var d=0; d<size; d++) {
    dx = cx + d * direction;
    dy = cy + d * direction;
    i = (dy * w * 4) + (dx * 4);

    id.data[i] = color[0];
    id.data[i+1] = color[1];
    id.data[i+2] = color[2];
    id.data[i+3] = color[3];

    dx = cx - d * direction;
    dy = cy - d * direction;
    i = (dy * w * 4) + (dx * 4);

    id.data[i] = color[0];
    id.data[i+1] = color[1];
    id.data[i+2] = color[2];
    id.data[i+3] = color[3];
  }

  base.ctx.putImageData(id, 0, 0);

  return base;
}

function loadDynamicBrush(shape, size, color) {
  var base_img = new Image();
  var deferred = $.Deferred();

  base_img.addEventListener('load', function() {
    var new_cursor = Canvas(base_img);
    var cx = ~~(new_cursor.width / 2);
    var cy = ~~(new_cursor.height / 2);

    if (shape === 'diagonal') {
      new_cursor = paintSlash(size, color, new_cursor, 1);
    } else if (shape === 'reverse_diagonal') {
      new_cursor = paintSlash(size, color, new_cursor, -1);
    } else {
      console.error('Unexpected shame:', shape);
    }

    var cursor_prop = "url(" + new_cursor.toDataURL() + ") " +
      cx + " " + cy + ", auto";

    deferred.resolve(cursor_prop);
  });
  base_img.src = "images/cursors/precise-dotted.png";

  return deferred.promise();
}

function E(t){
	return document.createElement(t);
}

function hex_to_rgba_arr(hex) {
  if (!hex) {
    return [0,0,0,255];
    console.log('jeez');
  }

  return [
    parseInt(hex.substr(1, 2), 16),
    parseInt(hex.substr(3, 2), 16),
    parseInt(hex.substr(5, 2), 16),
    255
  ];
}

function get_rgba_from_color(color){
	
	var _c = new Canvas(1, 1);
	
	_c.ctx.fillStyle = color;
	_c.ctx.fillRect(0, 0, 1, 1);
	
	var _id = _c.ctx.getImageData(0, 0, 1, 1);
	
	// We could just return _id.data, but let's return an array instead
	var fill_r = _id.data[0];
	var fill_g = _id.data[1];
	var fill_b = _id.data[2];
	var fill_a = _id.data[3];
	return [fill_r, fill_g, fill_b, fill_a];
	
}

function Canvas(width, height){
	var image = width;
	
	var new_canvas = E("canvas");
	var new_ctx = new_canvas.getContext("2d");
	
	new_canvas.ctx = new_ctx;
	
	new_ctx.copy = function(image){
		new_canvas.width = image.naturalWidth || image.width;
		new_canvas.height = image.naturalHeight || image.height;
		new_ctx.drawImage(image, 0, 0);
	};
	
	if(width && height){
		// new Canvas(width, height)
		new_canvas.width = width;
		new_canvas.height = height;
	}else if(image){
		// new Canvas(image)
		new_ctx.copy(image);
	}
	
	// This must come after sizing the canvas
	new_ctx.imageSmoothingEnabled = false;
	new_ctx.mozImageSmoothingEnabled = false;
	new_ctx.msImageSmoothingEnabled = false;
	
	return new_canvas;
}
