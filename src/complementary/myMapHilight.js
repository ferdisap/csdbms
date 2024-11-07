// import $ from 'jquery';
function defaultsOpts() {
  return {
    fill: true,
    fillColor: '000000',
    fillOpacity: 0.2,
    stroke: true,
    strokeColor: 'ff0000',
    strokeOpacity: 1,
    strokeWidth: 1,
    fade: true,
    alwaysOn: false,
    neverOn: false,
    groupBy: false,
    wrapClass: true,
    // plenty of shadow:
    shadow: false,
    shadowX: 0,
    shadowY: 0,
    shadowRadius: 6,
    shadowColor: '000000',
    shadowOpacity: 0.8,
    shadowPosition: 'outside',
    shadowFrom: false
  }
}

function is_image_loaded(img) {
  if (!img.complete) { return false; } // IE
  if (typeof img.naturalWidth != "undefined" && img.naturalWidth === 0) { return false; } // Others
  return true;
}

// define has_canvas
const has_canvas = !!document.createElement('canvas').getContext;

let hex_to_decimal, css3color, create_canvas_for, add_shape_to, clear_canvas;

if (has_canvas) {
  hex_to_decimal = (hex) => Math.max(0, Math.min(parseInt(hex, 16), 255));
  css3color = (color, opacity) => 'rgba(' + hex_to_decimal(color.substr(0, 2)) + ',' + hex_to_decimal(color.substr(2, 2)) + ',' + hex_to_decimal(color.substr(4, 2)) + ',' + opacity + ')';
  create_canvas_for = function (img) {
    const c = document.createElement('canvas');
    c.setAttribute('style', 'width:' + img.width + 'px;height:' + img.height + 'px;');
    c.getContext("2d").clearRect(0, 0, img.width, img.height);
    return c;
  };

  const draw_shape = function (context, shape, coords, x_shift, y_shift) {
    x_shift = x_shift || 0;
    y_shift = y_shift || 0;

    context.beginPath();
    if (shape === 'rect') {
      // x, y, width, height
      context.rect(coords[0] + x_shift, coords[1] + y_shift, coords[2] - coords[0], coords[3] - coords[1]);
    } else if (shape === 'poly') {
      context.moveTo(coords[0] + x_shift, coords[1] + y_shift);
      for (let i = 2; i < coords.length; i += 2) {
        context.lineTo(coords[i] + x_shift, coords[i + 1] + y_shift);
      }
    } else if (shape === 'circ') {
      // x, y, radius, startAngle, endAngle, anticlockwise
      context.arc(coords[0] + x_shift, coords[1] + y_shift, coords[2], 0, Math.PI * 2, false);
    }
    context.closePath();
  };

  add_shape_to = function (canvas, shape, coords, options, name) {
    const context = canvas.getContext('2d');

    // Because I don't want to worry about setting things back to a base state

    // Shadow has to happen first, since it's on the bottom, and it does some clip /
    // fill operations which would interfere with what comes next.
    if (options.shadow) {
      context.save();
      if (options.shadowPosition == "inside") {
        // Cause the following stroke to only apply to the inside of the path
        draw_shape(context, shape, coords);
        context.clip();
      }

      // Redraw the shape shifted off the canvas massively so we can cast a shadow
      // onto the canvas without having to worry about the stroke or fill (which
      // cannot have 0 opacity or width, since they're what cast the shadow).
      const x_shift = canvas.width * 100;
      const y_shift = canvas.height * 100;
      draw_shape(context, shape, coords, x_shift, y_shift);

      context.shadowOffsetX = options.shadowX - x_shift;
      context.shadowOffsetY = options.shadowY - y_shift;
      context.shadowBlur = options.shadowRadius;
      context.shadowColor = css3color(options.shadowColor, options.shadowOpacity);

      // Now, work out where to cast the shadow from! It looks better if it's cast
      // from a fill when it's an outside shadow or a stroke when it's an interior
      // shadow. Allow the user to override this if they need to.
      let shadowFrom = options.shadowFrom;
      if (!shadowFrom) {
        if (options.shadowPosition == 'outside') {
          shadowFrom = 'fill';
        } else {
          shadowFrom = 'stroke';
        }
      }
      if (shadowFrom == 'stroke') {
        context.strokeStyle = "rgba(0,0,0,1)";
        context.stroke();
      } else if (shadowFrom == 'fill') {
        context.fillStyle = "rgba(0,0,0,1)";
        context.fill();
      }
      context.restore();

      // and now we clean up
      if (options.shadowPosition == "outside") {
        context.save();
        // Clear out the center
        draw_shape(context, shape, coords);
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = "rgba(0,0,0,1);";
        context.fill();
        context.restore();
      }
    }

    context.save();

    draw_shape(context, shape, coords);

    // fill has to come after shadow, otherwise the shadow will be drawn over the fill,
    // which mostly looks weird when the shadow has a high opacity
    if (options.fill) {
      context.fillStyle = css3color(options.fillColor, options.fillOpacity);
      context.fill();
    }
    // Likewise, stroke has to come at the very end, or it'll wind up under bits of the
    // shadow or the shadow-background if it's present.
    if (options.stroke) {
      context.strokeStyle = css3color(options.strokeColor, options.strokeOpacity);
      context.lineWidth = options.strokeWidth;
      context.stroke();
    }

    context.restore();

    if (options.fade) {
      canvas.style.opacity = 0;
      canvas.animate({opacity: [1,1]},{duration: 1, iterations: Infinity});
    }
  };

  clear_canvas = (canvas) => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }
} else {
  create_canvas_for = function(img){
    // return $('<var style="zoom:1;overflow:hidden;display:block;width:' + img.width + 'px;height:' + img.height + 'px;"></var>').get(0);
    var c = document.createElement('var');
    c.setAttribute('style', 'zoom:1;overflow:hidden;display:block;width:' + img.width + 'px;height:' + img.height + 'px;');
    return c;
  };
  add_shape_to = function (canvas, shape, coords, options, name) {
    var i, fill, stroke, opacity, e;
    for (i in coords) { coords[i] = parseInt(coords[i], 10); }
    fill = '<v:fill color="#' + options.fillColor + '" opacity="' + (options.fill ? options.fillOpacity : 0) + '" />';
    stroke = (options.stroke ? 'strokeweight="' + options.strokeWidth + '" stroked="t" strokecolor="#' + options.strokeColor + '"' : 'stroked="f"');
    opacity = '<v:stroke opacity="' + options.strokeOpacity + '"/>';
    if (shape === 'rect') {
      e = document.createElementNS('urn:schemas-microsoft-com:vml','v:rect');
      e.setAttribute('name', name);
      e.setAttribute('filled', 't '+ stroke);
      e.setAttribute('style', 'zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + coords[0] + 'px;top:' + coords[1] + 'px;width:' + (coords[2] - coords[0]) + 'px;height:' + (coords[3] - coords[1]) + 'px;');
      // e = $('<v:rect name="' + name + '" filled="t" ' + stroke + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + coords[0] + 'px;top:' + coords[1] + 'px;width:' + (coords[2] - coords[0]) + 'px;height:' + (coords[3] - coords[1]) + 'px;"></v:rect>');
    } else if (shape === 'poly') {
      e = document.createElementNS('urn:schemas-microsoft-com:vml','v:shape');
      e.setAttribute('filled', 't '+ stroke);
      e.setAttribute('coordorigin', canvas.width + ',' + canvas.height);
      e.setAttribute('path', 'm ' + coords[0] + ',' + coords[1] + ' l ' + coords.join(',') + ' x e');
      e.setAttribute('style', 'zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:' + canvas.width + 'px;height:' + canvas.height + 'px;')
      // e = $('<v:shape name="' + name + '" filled="t" ' + stroke + ' coordorigin="0,0" coordsize="' + canvas.width + ',' + canvas.height + '" path="m ' + coords[0] + ',' + coords[1] + ' l ' + coords.join(',') + ' x e" style="zoom:1;margin:0;padding:0;display:block;position:absolute;top:0px;left:0px;width:' + canvas.width + 'px;height:' + canvas.height + 'px;"></v:shape>');
    } else if (shape === 'circ') {
      e = document.createElementNS('urn:schemas-microsoft-com:vml','v:oval');
      e.setAttribute('name', name);
      e.setAttribute('filled', 't '+ stroke);
      e.setAttribute('coordorigin', canvas.width + ',' + canvas.height);
      e.setAttribute('style', 'zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + (coords[0] - coords[2]) + 'px;top:' + (coords[1] - coords[2]) + 'px;width:' + (coords[2] * 2) + 'px;height:' + (coords[2] * 2) + 'px;');
      // e = $('<v:oval name="' + name + '" filled="t" ' + stroke + ' style="zoom:1;margin:0;padding:0;display:block;position:absolute;left:' + (coords[0] - coords[2]) + 'px;top:' + (coords[1] - coords[2]) + 'px;width:' + (coords[2] * 2) + 'px;height:' + (coords[2] * 2) + 'px;"></v:oval>');
    }
    // e.get(0).innerHTML = fill + opacity;
    e.innerHTML = fill + opacity;
    // $(canvas).append(e);
    canvas.appendChild(e);
  };
  clear_canvas = function (canvas) {
    // jquery1.8 + ie7
    // var $html = $("<div>" + canvas.innerHTML + "</div>");
    // $html.children('[name=highlighted]').remove();
    // $(canvas).html($html.html());
    var html = document.createElement('div');
    html.innerHTML = canvas.innerHTML;
    html.querySelectorAll('[name=highlighted]').forEach(el => el.remove());
    canvas.innerHTML = html.innerHTML;
  };
}

function shape_from_area(area) {
  let coords, shape = (area.getAttribute('shape') || 'rect').toLowerCase().substr(0, 4);
  if (shape === 'defa') {
    // 'default' doesn't really apply to what we're doing; it's the background state
    return;
  }
  coords = (area.getAttribute('coords') || '').split(',');
  for (let i = 0; i < coords.length; i++) { coords[i] = parseFloat(coords[i]); }
  return [shape, coords];
}
// top.jq = $;
function options_from_area(area, options) {
  return Object.assign({},options, area.dataset['maphilight']);
  // var $area = $(area);
  // return $.extend({}, options, $.metadata ? $area.metadata() : false, $area.data('maphilight'));
}

const canvas_style = {
  position: 'absolute',
  left: 0,
  top: 0,
  padding: 0,
  border: 0
};

top.ie_hax_done = top.ie_hax_done ?? false;
if (!has_canvas && !ie_hax_done) {
  document.addEventListener('load', function () {
    document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
    var style = document.createStyleSheet();
    var shapes = ['shape', 'rect', 'oval', 'circ', 'fill', 'stroke', 'imagedata', 'group', 'textbox'];
    shapes.forEach(function(v){
      style.addRule('v\\:' + v, "behavior: url(#default#VML); antialias:true");
    })
  });
  top.ie_hax_done = true;
}

// define has_VML
const a = document.createElement('div');
a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
const b = a.firstChild;
b.style.behavior = "url(#default#VML)";
const has_VML = (b ? typeof b.adj == "object" : true);

// Check for areas with alwaysOn set. These are added to a *second* canvas,
// which will get around flickering during fading.
function _onAlwaysOn(canvas_always, options, img) {
  if (canvas_always) {
    clear_canvas(canvas_always);
  }
  if (!has_canvas) {
    // $(canvas).empty();
    while (canvas.firstChild){ canvas.removeChild(canvas.firstChild); }
  }
  const defaultWidth = parseInt(this.getAttribute('width')) || img.naturalWidth;
  const defaultHeight = parseInt(this.getAttribute('height')) || img.naturalHeight;
  this.querySelectorAll('area[coords]').forEach(function (area) {
    // resize coords as per image width
    const shape = (area.dataset['shape'] || area.getAttribute('shape'));
    const coordsString = (area.dataset['coords'] || area.getAttribute('coords'));
    const coordsArrayOld = coordsString.split(",");
    const coordsArrayNew = coordsArrayOld.map((v, i) => {
      // Scale the coordinate from the original width/height to the actual rendered width/height (i.e. offset)
      return i % 2 === 0 ? (Number(v) * (img.width / defaultWidth)) : (Number(v) * (img.height / defaultHeight));
    });
    area.setAttribute('coords', coordsArrayNew.toString());

    const area_options = options_from_area(area, options)
    if (area_options.alwaysOn) {
      if (!canvas_always && has_canvas) {
        canvas_always = create_canvas_for(img);
        for(const k in canvas_style){ 
          canvas_always.style[k] = canvas_style[k];
        }
        canvas_always.width = img.width;
        canvas_always.height = img.height;
        img.parentElement.insertBefore(canvas_always, img);
      }
      area_options.fade = area_options.alwaysOnFade; // alwaysOn shouldn't fade in initially
      shape = shape_from_area(area);
      if (!shape) {
        return;
      }
      if (has_canvas) {
        add_shape_to(canvas_always, shape[0], shape[1], area_options, "");
      } else {
        add_shape_to(canvas, shape[0], shape[1], area_options, "");
      }
    }
  });
}

function _onMouseOver(canvas, options, e){
  const area = e.target;
  const area_options = options_from_area(area, options);
  let shape;
  if (!area_options.neverOn && !area_options.alwaysOn) {
    shape = shape_from_area(area);
    if (!shape) {
      return;
    }
    add_shape_to(canvas, shape[0], shape[1], area_options, "highlighted");
    if (area_options.groupBy) {
      if (typeof area_options.groupBy == 'string') {
        area_options.groupBy = [area_options.groupBy];
      }
      area_options.groupBy.forEach((groupitem) => { // this adalah map
        let areas;
        // two ways groupBy might work; attribute and selector
        if (/^[a-zA-Z][\-a-zA-Z]+$/.test(groupitem)) {
          areas = this.querySelectorAll('area[' + groupitem + '="' + this.getAttribute(groupitem) + '"]');
        } else {
          areas = this.querySelectorAll(groupitem);
        }
        areas.forEach((a) => {
          if (a != groupitem) {
            let subarea_options = options_from_area(a, options);
            if (!subarea_options.neverOn && !subarea_options.alwaysOn) {
              const shape = shape_from_area(a);
              add_shape_to(canvas, shape[0], shape[1], subarea_options, "highlighted");
            }
          }
        })
      })
    }
    // workaround for IE7, IE8 not rendering the final rectangle in a group
    if (!has_canvas) {
      var vrect = document.createElementNS('urn:schemas-microsoft-com:vml','v:rect');
      canvas.appendChild(vrect);
    }
  }
}
function _onMouseOut(canvas){
  clear_canvas(canvas);
}

/**
 * cara pakai:
 * maphilight(document.querySelector('img'),{})
 * saat ini options belum di coba
 * check developmentnya di D:\application\Image-map\tes_highlight\myMapHilight.js
 * untuk resolve dimensi <img> dan coordinate, tambahkan attribute width dan height di <map> dengan value sesuai image size saat pembuatan coordinate (size original sebelum <img> di resize)
 * 
 * jika ada child atau coordinate inside coordinate, maka child pertama adalah inner coordinate
 * eg:
 *  <area shape=rect coords="50,50,100,100"> <!-- the hole in the red box -->
 *  <area shape=rect coords="25,25,125,125" href="red.html" alt="Red box.">
 * @param {HTMLElement} img 
 * @param {Object} opts 
 * @returns 
 */
function maphilight(img, opts) {
  let canvas_always;
  const options = Object.assign(defaultsOpts(), opts)

  if (!is_image_loaded(img)) {
    return window.setTimeout(() => {
      maphilight(img, options);
    }, 200);
  }

  const usemap = img.getAttribute('usemap');
  if (!usemap) return;

  const map = document.querySelector('map[name="' + usemap.substring(1) + '"]');
  console.log(map);
  if (!(img.matches('img,input[type="image"]') && usemap && map)) return;

  const canvas = create_canvas_for(img);
  for(const k in canvas_style){ 
    canvas.style[k] = canvas_style[k];
    img.style[k] = canvas_style[k];
  }
  canvas.height = img.height;
  canvas.width = img.width;

  console.log('aa');

  // Store the current width/height of the image here in case it's being sized by CSS that'll
  // be affected by it being wrapped by the div below. (e.g. width:50%)
  // For now, we'll trust that something else is handling scaling the <area>'s coords to account
  // for this non-static sizing...
  if(!map.onAlwaysOn) map.onAlwaysOn = _onAlwaysOn.bind(map, canvas_always, options, img);
  if(!map.onMouseOver) map.onMouseOver = _onMouseOver.bind(map, canvas, options);
  if(!map.onMouseOut) map.onMouseOut = _onMouseOut.bind(undefined, canvas);

  if (img.classList.contains('maphilighted')) {
    // We're redrawing an old map, probably to pick up changes to the options.
    // Just clear out all the old stuff.
    const wrapper = img.parentElement;
    wrapper.parentElement.insertBefore(img, wrapper);
    wrapper.remove();
    map.removeEventListener('alwaysOn', map.onAlwaysOn);
    map.removeEventListener('mouseover', map.onMouseOver);
    map.removeEventListener('mouseout', map.onMouseOut);
  }

  //Formating the image source. IE > 9 has issue with new line characters
  // const imgSrc = img.src.replace(/[\n\r]/g, '');
  const wrap = document.createElement('div');
  wrap.style.display = 'block';
  wrap.style.background = 'url("' + img.src + '")';
  wrap.style.backgroundSize = 'contain';
  wrap.style.backgroundRepeat = 'no-repeat';
  wrap.style.position = 'relative';
  wrap.style.padding = '0px';
  wrap.style.width = img.width + 'px';
  wrap.style.height = img.height + 'px';
  if (options.wrapClass) {
    if (options.wrapClass === true) {
      wrap.setAttribute('class', img.getAttribute('class'));
    } else {
      wrap.setAttribute('class', options.wrapClass);
    }
  }

  // Firefox has a bug that prevents tabbing into the image map if
  // we set opacity of the image to 0, but very nearly 0 works!
  img.parentElement.insertBefore(wrap, img);
  img.style.opacity = '0.0000000001';
  img.remove();
  if (has_VML) img.classList.add('filter', 'Alpha(opacity=0)');
  wrap.appendChild(img);

  map.addEventListener('alwaysOn', map.onAlwaysOn);
  map.dispatchEvent(new Event('alwaysOn'));
  map.addEventListener('mouseover', map.onMouseOver);
  map.addEventListener('mouseout', map.onMouseOut);
  img.parentElement.insertBefore(canvas, img); // if we put this after, the mouseover events wouldn't fire.
  img.classList.add('maphilighted');
};
export { maphilight }
