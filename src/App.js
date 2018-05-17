// Authors: Josh Bourquin

// Style scripts
//import "@blueprintjs/core/lib/css/blueprint.css"
//import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "./App.css"

// React components
import React, { Component } from 'react'
import Globe from './graphics/Globe'



// Main application
class App extends Component {
  render() {
    return (
      <div className="App">
        <Globe />
      </div>
    );
  }
}

export default App;
