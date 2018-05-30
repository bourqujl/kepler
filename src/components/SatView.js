import "./SatView.css"
import React, { Component } from 'react'
import debounce from 'debounce'
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import { WGS84Spheroid, WGS84GridSection } from '../graphics/geometry'

import naturalEarthA1 from '../textures/natural_earth_A1.jpg'
import naturalEarthB1 from '../textures/natural_earth_B1.jpg'
import naturalEarthC1 from '../textures/natural_earth_C1.jpg'


export default class SatView extends Component {
  
  constructor(props) {
    super(props)
    this.renderScene = this.renderScene.bind(this)
    this.startAnimation = this.startAnimation.bind(this)
    this.stopAnimation = this.stopAnimation.bind(this)
    this.buildGlobe = this.buildGlobe.bind(this)
  }

  componentDidMount() {
    const width = this.element.clientWidth
    const height = this.element.clientHeight
    const aspect = width / height
    
    // Build Scene
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setSize(width, height)
    this.element.appendChild(this.renderer.domElement)
    this.camera.position.z = 3

    // Add controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // Bind Events
    this.controls.addEventListener('change', this.resizeScene.bind(this)) 
    this.resizeEventListener = debounce(this.resizeScene.bind(this), 250)
    window.addEventListener('resize', this.resizeEventListener)

    // Build globe
    this.buildGlobe()

    // Render the scene
    this.renderScene()
  }

  componentWillUnmount() {
    this.controls.removeEventListener('change', this.resizeScene.bind(this))
    window.removeEventListener('resize', this.resizeEventListener)
    this.element.removeChild(this.renderer.domElement)
  }

  /* Build globe */
  buildGlobe() {
    //let texture = new THREE.TextureLoader().load(globeTexture, this.renderScene)
    //texture.flipY = false
    //texture.wrapS = THREE.RepeatWrapping;
    //texture.repeat.x = - 1;
    
    let globe_geometry = new THREE.ParametricGeometry(WGS84GridSection(180, 360, 0, 180), 8, 8)
    let globe_material = new THREE.MeshBasicMaterial({wireframe: true})
    let globe = new THREE.Mesh(globe_geometry, globe_material)
    let normals = new THREE.FaceNormalsHelper(globe)
    

    this.scene.add(globe)
    this.scene.add(normals)

    //console.log(object)
  }

  // Animate object
  startAnimation() {
    this.renderScene()
    this.globe.rotation.x += 0.001;
    this.globe.rotation.y += 0.001;
    this.frameId = requestAnimationFrame(this.startAnimation)
  }

  stopAnimation() {
    cancelAnimationFrame(this.frameId)
  }

  /* Resize the WebGL scene when the user resizes the window */
  resizeScene() {
    const width = this.element.clientWidth
    const height = this.element.clientHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.renderScene()
  }

  /* Renders the WebGL scene */
  renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  /* Renders the React component */
  render() {
    return (
      <div className="Planet" ref={(element) => {this.element = element}} />
    )
  }
}
