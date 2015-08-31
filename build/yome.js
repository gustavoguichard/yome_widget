// Tools
'use strict';

var Reloader = Reloader || {};

function l(x) {
  console.log(x);
  return x;
}

function every(f, x) {
  return Array.isArray(x) ? x.every(f) : [x].every(f);
}

Reloader.reloadFile = function (path) {
  var js = document.createElement('script');
  js.setAttribute('src', path + '?rel=' + new Date().getTime());
  document.body.appendChild(js);
  setTimeout(function () {
    return document.body.removeChild(js);
  }, 1000);
};

Reloader.startReloading = function (files) {
  setTimeout(function () {
    return files.map(Reloader.reloadFile);
  }, 1000);
};

Reloader.startReloading(['build/yome.js']);

// Yome
var Yome = Yome || {};
var PlayArea = PlayArea || document.getElementById('playarea');

Yome.initialState = function () {
  return { sides: [1, 2, 3, 4, 5, 6, 7, 8].map(function () {
      return new Object();
    }) };
};

Yome.state = Yome.state || Yome.initialState();

// Performance optimizations
Yome.pureRender = Yome.pureRender || React.createClass({
  shouldComponentUpdate: function shouldComponentUpdate(nextProps, _) {
    return !(this.props.data.length === nextProps.data.length && every(function (p, i) {
      return p === nextProps.data[i];
    }, this.props.data));
  },
  render: function render() {
    return this.props.f.apply(null, this.props.data);
  }
});

Yome.memoizeReact = function (f) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return React.createElement(Yome.pureRender, { data: arguments, f: f });
  };
};

Yome.sideCount = function (st) {
  return st.sides.length;
};
Yome.sliceTheta = function (st) {
  return 2 * Math.PI / Yome.sideCount(st);
};

Yome.rotate = function (theta, point) {
  var sint = Math.sin(theta),
      cost = Math.cos(theta);
  return {
    x: point.x * cost - point.y * sint,
    y: point.x * sint + point.y * cost
  };
};

Yome.radialPoint = function (radius, theta) {
  return Yome.rotate(theta, { x: 0, y: radius });
};

Yome.pointsToPointsString = function (points) {
  return points.map(function (p) {
    return p.x + ',' + p.y;
  }).join(' ');
};

// Walls
Yome.sidePoints = function (st) {
  return st.sides.map(function (_, i) {
    return Yome.radialPoint(180, i * Yome.sliceTheta(st));
  });
};

Yome.drawWalls = function (st) {
  return React.createElement('polygon', { points: Yome.pointsToPointsString(Yome.sidePoints(st)) });
};

// Windows
Yome.windowPoints = function (st) {
  var theta = Yome.sliceTheta(st);
  var indent = theta / 6;
  return [Yome.radialPoint(160, indent), Yome.radialPoint(160, theta - indent), Yome.radialPoint(100, theta / 2)];
};
Yome.drawWindow = function (st) {
  return React.createElement('polygon', { points: Yome.pointsToPointsString(Yome.windowPoints(st)) });
};

// Doors
Yome.doorPoints = function (st) {
  var indent = Yome.sliceTheta(st) / 8;
  return [Yome.radialPoint(165, indent), Yome.radialPoint(165, -indent), Yome.radialPoint(90, -indent), Yome.radialPoint(90, indent)];
};
Yome.drawDoor = function (st) {
  return React.createElement('polygon', { points: Yome.pointsToPointsString(Yome.doorPoints(st)) });
};

// ZIP Doors
Yome.drawLine = function (line) {
  return React.createElement('line', { x1: line.start.x, y1: line.start.y,
    x2: line.end.x, y2: line.end.y });
};

Yome.drawZipDoor = function (st) {
  var theta = Yome.sliceTheta(st);
  var indent = 0.15 * (theta / 6);
  var lines = [0, 1, 2, 3, 4, 5, 6, 7, 8].reduce(function (acc, curr) {
    var dist = 170 - 10 * curr;
    return acc.concat({
      start: Yome.radialPoint(dist, -indent),
      end: Yome.radialPoint(dist, indent)
    });
  }, [{
    start: Yome.radialPoint(180, 0),
    end: Yome.radialPoint(90, 0)
  }]);
  return React.createElement(
    'g',
    null,
    lines.map(Yome.drawLine)
  );
};

// Stove Vent
Yome.drawStoveVent = function (st) {
  var theta = Yome.sliceTheta(st);
  var point = Yome.radialPoint(155, 0);
  return React.createElement('ellipse', { cx: point.x, cy: point.y, rx: '14', ry: '8', key: 'stove-vent' });
};

// Dispatcher
Yome.itemRenderDispatch = {
  'window': Yome.memoizeReact(Yome.drawWindow),
  'door-frame': Yome.memoizeReact(Yome.drawDoor),
  'zip-door': Yome.memoizeReact(Yome.drawZipDoor),
  'stove-vent': Yome.memoizeReact(Yome.drawStoveVent)
};

Yome.itemRender = function (type, st) {
  return (Yome.itemRenderDispatch[type] || function (x) {
    return null;
  })(st);
};

Yome.exampleData = (function (state) {
  state.sides[0].face = 'window';
  state.sides[0].corner = 'zip-door';
  state.sides[3].face = 'window';
  state.sides[5].corner = 'door-frame';
  state.sides[5].face = 'window';
  state.sides[7].corner = 'stove-vent';
  return state;
})(Yome.initialState());

Yome.sliceDeg = function (st) {
  return 360 / Yome.sideCount(st);
};
Yome.sideSlice = function (st, i) {
  var side = st.sides[i];
  return side.corner || side.face ? React.createElement(
    'g',
    { transform: 'rotate(' + Yome.sliceDeg(st) * i + ',0,0)' },
    Yome.itemRender(side.corner, st),
    Yome.itemRender(side.face, st)
  ) : null;
};

Yome.drawYome = function (st) {
  return React.createElement(
    'g',
    { transform: 'rotate(' + Yome.sliceDeg(st) / 2 + ',0,0)' },
    Yome.drawWalls(st),
    st.sides.map(function (side, i) {
      return Yome.sideSlice(st, i);
    })
  );
};

Yome.svgWorld = function (children) {
  return React.createElement(
    'svg',
    { height: '500', width: '500', viewBox: '-250 -250 500 500',
      preserveAspectRatio: 'xMidYMid meet' },
    children
  );
};

// Side Controls
Yome.sideOptions = function () {
  return ['HexaYome', 'SeptaYome', 'OctaYome'].map(function (l, i) {
    return React.createElement(
      'option',
      { value: i + 6 },
      l
    );
  });
};

Yome.sideCountInput = function (st) {
  return React.createElement(
    'div',
    { className: 'top-control' },
    React.createElement(
      'span',
      null,
      ' Size of Yome '
    ),
    React.createElement(
      'select',
      { onChange: Yome.eventHandler(Yome.changeSideCount),
        value: Yome.sideCount(st) },
      Yome.sideOptions()
    )
  );
};

// Window Controls
Yome.worldPosition = function (point) {
  return { x: point.x + 250, y: point.y + 250 };
};

Yome.windowControl = function (st, side, i) {
  var theta = Yome.sliceTheta(st) * (i + 1);
  var pos = Yome.worldPosition(Yome.radialPoint(200, theta));
  var add = !side.face;
  return React.createElement(
    'div',
    { className: 'control-holder', style: { top: pos.y,
        left: pos.x } },
    React.createElement(
      'a',
      { className: 'window-control-offset ' + (add ? 'add' : 'remove'),
        onClick: Yome.eventHandler(Yome.addRemoveWindow(i)),
        href: '#' },
      add ? '+ window' : '- window'
    )
  );
};

Yome.windowControls = function (st) {
  return st.sides.map(function (side, i) {
    return Yome.windowControl(st, side, i);
  });
};

// Side effecting
Yome.eventHandler = function (f) {
  return function (e) {
    e.preventDefault();
    f(e.target.value);
    Yome.render();
  };
};

Yome.changeSideCount = function (newCount) {
  var nArray = Array.apply(null, Array(parseInt(newCount)));
  Yome.state.sides = nArray.map(function (_, i) {
    return Yome.state.sides[i] || {};
  });
};

Yome.addRemoveWindow = function (i) {
  return function (_) {
    var side = Yome.state.sides[i];
    side.face = !side.face ? 'window' : null;
  };
};

// PlayArea
Yome.playArea = function (children) {
  return React.render(Yome.svgWorld(children), PlayArea);
};

Yome.clearPlayArea = function () {
  return React.unmountComponentAtNode(PlayArea);
};

// Renderer
Yome.widget = function (st) {
  return React.createElement(
    'div',
    { className: 'yome-widget' },
    Yome.sideCountInput(st),
    React.createElement(
      'div',
      { className: 'yome-widget-body' },
      Yome.windowControls(st),
      Yome.svgWorld(Yome.drawYome(st))
    )
  );
};

Yome.render = function () {
  return React.render(Yome.widget(Yome.state), document.getElementById('app'));
};

Yome.render();