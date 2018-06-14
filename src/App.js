// Authors: Josh Bourquin

// Style scripts
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "./App.css"

// React components
import React, { Component } from 'react'
import GroundTrack from './components/GroundTrack'

const satellites = [
    {
      name: 'WV01',
      tle: [
        '1 32060U 07041A   18165.58333333 -.00000322  00000-0 -13098-4 0 00002',
        '2 32060 097.3945 285.2684 0001022 059.4521 322.0476 15.24577351597461'
      ]
    },
    {
      name: 'WV02',
      tle: [
        '1 35946U 09035A   18165.58333333 -.00000170  00000-0 -56809-4 0 00001',
        '2 35946 098.4708 242.3582 0002463 057.0144 066.3320 14.37590730455561'
      ]
    },
    {
      name: 'WV03',
      tle: [
        '1 40115U 14048A   18165.58333333 -.00000544  00000-0 -64045-4 0 00001',
        '2 40115 097.8418 245.7508 0001591 129.9182 204.3429 14.84964671207899'
      ]
    },
    {
      name: 'WV04',
      tle: [
        '1 41848U 16067A   18165.58333333  .00001114  00000-0  13110-3 0 00006',
        '2 41848 097.9113 242.7539 0000227 118.8539 040.8279 14.84953246086050'
      ]
    },
    {
      name: 'GE01',
      tle: [
        '1 33331U 08042A   18165.58333333  .00000282  00000-0  53657-4 0 00004',
        '2 33331 098.1340 240.3318 0009266 196.0650 168.4717 14.64245056522146'
      ]
    }
]

// Main application
class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      datetime: new Date()
    }
    this.animate = this.animate.bind(this)
  }

  componentDidMount() {
    setInterval(this.animate, 500)
  }

  animate() {
    this.setState({datetime: new Date()})
  }

  render() {
    return (
      <div className="app">
        <GroundTrack datetime={this.state.datetime} satellites={satellites}/>
      </div>
    );
  }
}

export default App;
