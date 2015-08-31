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
    l('--- reloading files ---');
    files.map(Reloader.reloadFile);
  }, 3000);
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

Yome.sidePoints = function (st) {
  return st.sides.map(function (_, i) {
    return Yome.radialPoint(180, i * Yome.sliceTheta(st));
  });
};

Yome.pointsToPointsString = function (points) {
  return points.map(function (p) {
    return p.x + ',' + p.y;
  }).join(' ');
};

Yome.drawWalls = function (state) {
  return React.createElement('polygon', { points: Yome.pointsToPointsString(Yome.sidePoints(state)) });
};

Yome.svgWorld = function (children) {
  return React.createElement(
    'svg',
    { height: '500', width: '500', viewBox: '-250 -250 500 500',
      preserveAspectRatio: 'xMidYMid meet' },
    children
  );
};

Yome.playArea = function (children) {
  return React.render(Yome.svgWorld(children), PlayArea);
};

Yome.clearPlayArea = function () {
  return React.unmountComponentAtNode(PlayArea);
};