// Libraries
// import debounce from 'debounce'
import React, {Component} from 'react'
import {geoEquirectangular, geoPath, geoGraticule, geoNaturalEarth1, geoCircle} from 'd3-geo'
import * as topojson from 'topojson'
import * as d3 from 'd3'
import {solarTerminatorPosition} from '../utils/solar'
import {Satellite} from '../utils/satellite'

// Resources
import "./GroundTrack.css"
import world from "../resources/world-110m.json"

const clockFormat = d3.utcFormat("%Y-%m-%d %H:%M:%S UTC")
let color = d3.scaleOrdinal()
  .range(["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]);

export default class GroundTrack extends Component {
  
  constructor(props) {
    super(props)
    this.resizeScene = this.resizeScene.bind(this)
  }

  componentDidMount() {
    // Select the SVG element with D3
    this.svg = d3.select(this.element).select('svg')
    
    // Generate world map features
    let graticule = geoGraticule()
    this.features = {
      land: topojson.feature(world, world.objects.land),
      countries: topojson.feature(world, world.objects.countries),
      grid: graticule(),
      border: graticule.outline(),
      circle: geoCircle().radius(90)
    }

    // Initialize satellites
    this.satellites = {}
    this.props.satellites.forEach(s => {
      let sat = new Satellite(s.name, s.tle)
      this.satellites[sat.id] = sat
    })

    // Add event listeners
    window.addEventListener('resize', this.resizeScene)
    
    // Create the projection and draw the scene
    this.updateProjection()
    this.drawWorldMap()
    this.drawSolarTerminator()
    this.drawClock()
    this.drawGroundTracks()
    this.drawSatellites()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeScene)
  }

  shouldComponentUpdate(nextProps, nextState) {
    this.drawSolarTerminator()
    this.drawClock()
    this.drawSatellites()
    return false
  }

  componentDidUpdate(prevProps, prevState) {
  }

  resizeScene() {
    this.updateProjection()
    this.drawWorldMap()
    this.drawSolarTerminator()
    this.drawSatellites()
    this.drawClock()
  }

  updateProjection() {
    const width = this.element.clientWidth
    const height = this.element.clientHeight
    this.projection = geoEquirectangular().fitExtent([[20, 30],[width-20, height-20]], this.features.border)
    this.path = geoPath().projection(this.projection)
    this.svg.attr('width', width)
    this.svg.attr('height', height)
  }

  drawWorldMap() {
    this.land = this.land || this.svg.select('path.land')
    this.countries = this.countries || this.svg.select('path.countries')
    this.grid = this.grid || this.svg.select('path.grid')
    this.border = this.border || this.svg.select('path.border')
    this.land.attr('d', this.path(this.features.land))
    this.countries.attr('d', this.path(this.features.countries))
    this.grid.attr('d', this.path(this.features.grid))
    this.border.attr('d', this.path(this.features.border))
  }

  drawSolarTerminator() {
    this.solarTerminator = this.solarTerminator || this.svg.select('path.solar-terminator')
    this.features.circle.center(solarTerminatorPosition(this.props.datetime))
    this.solarTerminator.attr('d', this.path(this.features.circle()))
  }

  createSatelliteMarker(sat) {
    const g = this.svg.select('g.satellites').append('g')
      .attr('id', sat.id)
      .attr('class', 'marker')
      .style('fill', '#ccc')
    const circle = g.append('circle')
      .attr('r', 5)
      .style('fill', color(sat.id))
    const text = g.append('text')
      .text(sat.name)
      .attr('dominant-baseline', 'central')
      .style('fill', color(sat.id))
    return {g: g, circle: circle, text: text}
  }

  drawSatellites() {
    for (const key of Object.keys(this.satellites)) {
      const sat = this.satellites[key]
      const satState = sat.stateVectors(this.props.datetime)
      const [x, y] = this.projection([satState.longitude, satState.latitude])
      sat.marker = sat.marker || this.createSatelliteMarker(sat)
      sat.marker.circle.attr('cx', x).attr('cy', y)
      sat.marker.text.attr('x', x+10).attr('y', y)
    }
  }

  drawGroundTracks() {
    for (const key of Object.keys(this.satellites)) {
      const sat = this.satellites[key]
      const gt = sat.groundTrackFeature(this.props.datetime)
      const p = this.svg.select('g.ground-tracks').append('path')
      p.attr('d', this.path(gt))
      p.style('stroke', color(sat.id))
    }
  }

  drawClock() {
    this.clock = this.clock || this.svg.select('text.clock')
    this.clock.attr('x', this.svg.attr('width')/2)
    this.clock.attr('y', 20)
    this.clock.text(clockFormat(this.props.datetime))
  }

  render() {
    return (
      <div className="ground-track" ref={(element) => {this.element = element}}>
        <svg xmlns="http://www.w3.org/2000/svg">
          <path className="land"/>
          <path className="countries"/>
          <path className="grid"/>
          <path className="solar-terminator"/>
          <g className="ground-tracks"/>
          <g className="satellites"/>
          <path className="border"/>
          <text className="clock"/>
        </svg>
      </div>
    )
  }
}
