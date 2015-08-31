// Tools
const Reloader = Reloader || {}

function l(x) {
  console.log(x)
  return x
}

Reloader.reloadFile = (path) => {
  const js = document.createElement('script')
  js.setAttribute('src', `${path}?rel=${(new Date().getTime())}`)
  document.body.appendChild(js)
  setTimeout(() => document.body.removeChild(js), 1000)
}

Reloader.startReloading = (files) => {
  setTimeout(() => {
    l('--- reloading files ---')
    files.map(Reloader.reloadFile)
  }, 3000)
}

Reloader.startReloading(['build/yome.js'])

// Yome
const Yome = Yome || {}
const PlayArea = PlayArea || document.getElementById('playarea')

Yome.initialState = () => (
  { sides: [1,2,3,4,5,6,7,8].map(() => new Object()) })

Yome.state = Yome.state || Yome.initialState()

Yome.sideCount = (st) => st.sides.length
Yome.sliceTheta = (st) => 2 * Math.PI / Yome.sideCount(st)

Yome.rotate = (theta, point) => {
  const sint = Math.sin(theta), cost = Math.cos(theta)
  return {
    x: (point.x * cost) - (point.y * sint),
    y: (point.x * sint) + (point.y * cost)
  }
}

Yome.radialPoint = (radius, theta) =>
  Yome.rotate(theta, {x: 0, y: radius})

Yome.sidePoints = (st) =>
  st.sides.map((_, i) => Yome.radialPoint(180, i * Yome.sliceTheta(st)))

Yome.pointsToPointsString = (points) =>
  points.map(p => `${p.x},${p.y}`).join(' ')

Yome.drawWalls = (state) =>
  <polygon points={Yome.pointsToPointsString(Yome.sidePoints(state))} />

Yome.svgWorld = (children) =>
  <svg height='500' width='500' viewBox='-250 -250 500 500'
        preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>

Yome.playArea = (children) =>
  React.render(Yome.svgWorld(children), PlayArea)

Yome.clearPlayArea = () => React.unmountComponentAtNode(PlayArea)

