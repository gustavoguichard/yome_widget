// Tools
const Reloader = Reloader || {}

function l(x) {
  console.log(x)
  return x
}

function every(f, x) {
  return Array.isArray(x) ?
    x.every(f) :
    [x].every(f)
}

Reloader.reloadFile = path => {
  const js = document.createElement('script')
  js.setAttribute('src', `${path}?rel=${(new Date().getTime())}`)
  document.body.appendChild(js)
  setTimeout(() => document.body.removeChild(js), 1000)
}

Reloader.startReloading = files => {
  setTimeout(() => files.map(Reloader.reloadFile), 1000)
}

Reloader.startReloading(['build/yome.js'])

// Yome
const Yome = Yome || {}
const PlayArea = PlayArea || document.getElementById('playarea')

Yome.initialState = () => (
  { sides: [1,2,3,4,5,6,7,8].map(() => new Object()) })

Yome.state = Yome.state || Yome.initialState()

// Performance optimizations
Yome.pureRender = Yome.pureRender || React.createClass({
  shouldComponentUpdate(nextProps, _) {
    return !(this.props.data.length === nextProps.data.length &&
            every((p, i) => p === nextProps.data[i], this.props.data))
  },
  render() {
    return this.props.f.apply(null, this.props.data)
  }
})

Yome.memoizeReact = f =>
  function() {
    const args = Array.prototype.slice.call(arguments)
    return React.createElement(Yome.pureRender, { data: arguments, f: f })
  }

Yome.sideCount = st => st.sides.length
Yome.sliceTheta = st => 2 * Math.PI / Yome.sideCount(st)

Yome.rotate = (theta, point) => {
  const sint = Math.sin(theta), cost = Math.cos(theta)
  return {
    x: (point.x * cost) - (point.y * sint),
    y: (point.x * sint) + (point.y * cost)
  }
}

Yome.radialPoint = (radius, theta) =>
  Yome.rotate(theta, {x: 0, y: radius})

Yome.pointsToPointsString = points =>
  points.map(p => `${p.x},${p.y}`).join(' ')

// Walls
Yome.sidePoints = st =>
  st.sides.map((_, i) => Yome.radialPoint(180, i * Yome.sliceTheta(st)))

Yome.drawWalls = st =>
  <polygon points={ Yome.pointsToPointsString(Yome.sidePoints(st)) } />

// Windows
Yome.windowPoints = st => {
  const theta = Yome.sliceTheta(st)
  const indent = theta / 6
  return [
    Yome.radialPoint(160, indent),
    Yome.radialPoint(160, theta - indent),
    Yome.radialPoint(100, theta / 2),
  ]
}
Yome.drawWindow = st =>
  <polygon points={ Yome.pointsToPointsString(Yome.windowPoints(st)) } />

// Doors
Yome.doorPoints = st => {
  const indent = Yome.sliceTheta(st) / 8
  return [
    Yome.radialPoint(165, indent),
    Yome.radialPoint(165, -indent),
    Yome.radialPoint(90, -indent),
    Yome.radialPoint(90, indent),
  ]
}
Yome.drawDoor = st =>
  <polygon points={ Yome.pointsToPointsString(Yome.doorPoints(st)) } />

// ZIP Doors
Yome.drawLine = line =>
  <line x1={ line.start.x } y1={ line.start.y }
        x2={ line.end.x } y2={ line.end.y } />

Yome.drawZipDoor = st => {
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
Yome.drawStoveVent = st => {
  const theta = Yome.sliceTheta(st)
  const point = Yome.radialPoint(155, 0)
  return <ellipse cx={ point.x } cy={ point.y } rx='14' ry='8' key='stove-vent' />
}

// Dispatcher
Yome.itemRenderDispatch = {
  'window': Yome.memoizeReact(Yome.drawWindow),
  'door-frame': Yome.memoizeReact(Yome.drawDoor),
  'zip-door': Yome.memoizeReact(Yome.drawZipDoor),
  'stove-vent': Yome.memoizeReact(Yome.drawStoveVent),
}

Yome.itemRender = (type, st) =>
  (Yome.itemRenderDispatch[type] || (x => null))(st)

Yome.exampleData = (state => {
  state.sides[0].face = 'window'
  state.sides[0].corner = 'zip-door'
  state.sides[3].face = 'window'
  state.sides[5].corner = 'door-frame'
  state.sides[5].face = 'window'
  state.sides[7].corner = 'stove-vent'
  return state
})(Yome.initialState())

Yome.sliceDeg = st => 360 / Yome.sideCount(st)
Yome.sideSlice = (st, i) => {
  const side = st.sides[i]
  return side.corner || side.face ? (
    <g transform={ `rotate(${ Yome.sliceDeg(st) * i },0,0)` }>
      {Yome.itemRender(side.corner, st)}
      {Yome.itemRender(side.face, st)}
    </g>
  ) : null
}

Yome.drawYome = st =>
  <g transform={ `rotate(${ Yome.sliceDeg(st) / 2 },0,0)` }>
    {Yome.drawWalls(st)}
    {st.sides.map((side, i) => Yome.sideSlice(st, i))}
  </g>

Yome.svgWorld = children =>
  <svg height='500' width='500' viewBox='-250 -250 500 500'
        preserveAspectRatio="xMidYMid meet">
    {children}
  </svg>

// Side Controls
Yome.sideOptions = () =>
  ['HexaYome', 'SeptaYome', 'OctaYome'].map(
    (l, i) => <option value={ i + 6 }>{ l }</option>)

Yome.sideCountInput = st =>
  <div className='top-control'>
    <span> Size of Yome </span>
    <select onChange={ Yome.eventHandler(Yome.changeSideCount) }
            value={ Yome.sideCount(st) }>
      { Yome.sideOptions() }
    </select>
  </div>

// Window Controls
Yome.worldPosition = point => ({ x: point.x + 250, y: point.y + 250 })

Yome.windowControl = (st, side, i) => {
  const theta = Yome.sliceTheta(st) * (i + 1)
  const pos = Yome.worldPosition(Yome.radialPoint(200, theta))
  const add = !side.face
  return <div className='control-holder' style={ {top: pos.y,
                                                  left: pos.x} }>
    <a className={ `window-control-offset ${add ? 'add' : 'remove'}` }
        onClick={ Yome.eventHandler(Yome.addRemoveWindow(i)) }
        href='#'>
      { add ? '+ window' : '- window' }
    </a>
  </div>
}

Yome.windowControls = st =>
  st.sides.map((side, i) => Yome.windowControl(st, side, i))

// Side effecting
Yome.eventHandler = f =>
  (e => {
    e.preventDefault()
    f(e.target.value)
    Yome.render()
  })

Yome.changeSideCount = newCount => {
  const nArray = Array.apply(null, Array(parseInt(newCount)))
  Yome.state.sides = nArray.map((_, i) => Yome.state.sides[i] || {})
}

Yome.addRemoveWindow = i =>
  (_) => {
    const side = Yome.state.sides[i]
    side.face = (!side.face ? 'window' : null)
  }

// PlayArea
Yome.playArea = children =>
  React.render(Yome.svgWorld(children), PlayArea)

Yome.clearPlayArea = () => React.unmountComponentAtNode(PlayArea)

// Renderer
Yome.widget = st =>
  <div className='yome-widget'>
    { Yome.sideCountInput(st) }
    <div className='yome-widget-body'>
      { Yome.windowControls(st) }
      { Yome.svgWorld(Yome.drawYome(st)) }
    </div>
  </div>

Yome.render = () =>
  React.render(Yome.widget(Yome.state), document.getElementById('app'))

Yome.render()