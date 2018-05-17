import React, { Component } from 'react'
import debounce from 'debounce'
import * as THREE from 'three'

import "./Globe.css"

export default class Globe extends Component {
  constructor(props) {
    super(props)
    this.renderScene = this.renderScene.bind(this)
    this.bindEvents = this.bindEvents.bind(this)
    this.removeEvents = this.removeEvents.bind(this)
    this.startAnimation = this.startAnimation.bind(this)
    this.stopAnimation = this.stopAnimation.bind(this)
  }

  componentDidMount() {
    const width = this.element.clientWidth
    const height = this.element.clientHeight
    const aspect = width / height
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 )
    const renderer = new THREE.WebGLRenderer({antialias: true})

    this.renderer = renderer
    this.camera = camera
    this.scene = scene

    this.renderer.setSize(width, height)
    this.element.appendChild(this.renderer.domElement)

    // Add a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xff00ff })
    const cube = new THREE.Mesh(geometry, material)
    
    this.cube = cube
    this.camera.position.z = 4
    this.scene.add(cube)

    // Bind Events
    this.bindEvents()

    // Render the scene
    this.startAnimation()
  }

  componentWillUnmount() {
    this.removeEvents()
    this.stopAnimation()
    this.element.removeChild(this.renderer.domElement)
  }

  /* Bind/remove events */
  bindEvents() {
    this.resizeEventListener = debounce(this.resizeScene.bind(this), 250)
    window.addEventListener('resize', this.resizeEventListener)
  }

  removeEvents() {
    window.removeEventListener('resize', this.resizeEventListener)
  }

  // Animate object
  startAnimation() {
    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01
    this.renderScene()
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
      <div className="Globe" ref={(element) => {this.element = element}} />
    )
  }
}
