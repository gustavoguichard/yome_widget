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
  setTimeout(() => files.map(Reloader.reloadFile), 1000)
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

Yome.pointsToPointsString = (points) =>
  points.map(p => `${p.x},${p.y}`).join(' ')

// Walls
Yome.sidePoints = (st) =>
  st.sides.map((_, i) => Yome.radialPoint(180, i * Yome.sliceTheta(st)))

Yome.drawWalls = (state) =>
  <polygon points={ Yome.pointsToPointsString(Yome.sidePoints(state)) } />

// Windows
Yome.windowPoints = (st) => {
  const theta = Yome.sliceTheta(st)
  const indent = theta / 6
  return [
    Yome.radialPoint(160, indent),
    Yome.radialPoint(160, theta - indent),
    Yome.radialPoint(100, theta / 2),
  ]
}
Yome.drawWindow = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.windowPoints(st)) } />

// Doors
Yome.doorPoints = (st) => {
  const indent = Yome.sliceTheta(st) / 8
  return [
    Yome.radialPoint(165, indent),
    Yome.radialPoint(165, -indent),
    Yome.radialPoint(90, -indent),
    Yome.radialPoint(90, indent),
  ]
}
Yome.drawDoor = (st) =>
  <polygon points={ Yome.pointsToPointsString(Yome.doorPoints(st)) } />

// ZIP Doors
Yome.drawLine = (line) =>
  <line x1={ line.start.x } y1={ line.start.y }
        x2={ line.end.x } y2={ line.end.y } />

Yome.drawZipDoor = (st) => {
  const theta = Yome.sliceTheta(st)
  const indent = 0.15 * (theta / 6)
  const lines = [0,1,2,3,4,5,6,7,8].reduce((acc, curr) => {
    const dist = 170 - (10 * curr)
    return acc.concat({
      start: Yome.radialPoint(dist, -indent),
      end: Yome.radialPoint(dist, indent),
    })
  }, [{
    start: Yome.radialPoint(180, 0),
    end: Yome.radialPoint(90, 0),
  }])
  return <g>{ lines.map(Yome.drawLine) }</g>
}

// Stove Vent
Yome.drawStoveVent = (st) => {
  const theta = Yome.sliceTheta(st)
  const point = Yome.radialPoint(155, 0)
  return <ellipse cx={ point.x } cy={ point.y } rx='14' ry='8' key='stove-vent' />
}





Yome.svgWorld = (children) =>
  <svg height='500' width='500' viewBox='-250 -250 500 500'
        preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>

// PlayArea
Yome.playArea = (children) =>
  React.render(Yome.svgWorld(children), PlayArea)

Yome.clearPlayArea = () => React.unmountComponentAtNode(PlayArea)

Yome.playArea(<g>{Yome.drawZipDoor(Yome.state)}
                {Yome.drawStoveVent(Yome.state)}
                {Yome.drawWalls(Yome.initialState())}</g>)