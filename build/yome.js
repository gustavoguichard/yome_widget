// Tools
'use strict';

var Reloader = Reloader || {};

function l(x) {
  console.log(x);
  return x;
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

Yome.drawWalls = function (state) {
  return React.createElement('polygon', { points: Yome.pointsToPointsString(Yome.sidePoints(state)) });
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

Yome.svgWorld = function (children) {
  return React.createElement(
    'svg',
    { height: '500', width: '500', viewBox: '-250 -250 500 500',
      preserveAspectRatio: 'xMidYMid meet' },
    children
  );
};

// PlayArea
Yome.playArea = function (children) {
  return React.render(Yome.svgWorld(children), PlayArea);
};

Yome.clearPlayArea = function () {
  return React.unmountComponentAtNode(PlayArea);
};

Yome.playArea(React.createElement(
  'g',
  null,
  Yome.drawZipDoor(Yome.state),
  Yome.drawStoveVent(Yome.state),
  Yome.drawWalls(Yome.initialState())
));