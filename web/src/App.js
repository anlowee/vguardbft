import React from 'react';
import './App.css';
import Home from "./Home";
import Map from "./Map";
import Database from "./Database";
import { useCrossTabState } from "./Hook";

const defaultTruckInfo = [
  {
    truckNumber: 0,
    cargoType: 'Manure',
    cargoAmount: 3000,
    fromAddr: 'Ranch',
    toAddr: 'Farm',
    boothIndex: 1,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 1,
    cargoType: 'Corn',
    cargoAmount: 10000,
    fromAddr: 'Farm',
    toAddr: 'Ranch',
    boothIndex: 2,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 2,
    cargoType: 'Pineapple',
    cargoAmount: 5000,
    fromAddr: 'Farm',
    toAddr: 'Cannery',
    boothIndex: 3,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 3,
    cargoType: 'Meat',
    cargoAmount: 1000,
    fromAddr: 'Ranch',
    toAddr: 'Cannery',
    boothIndex: 4,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
]


function App() {
  const [trucks, setTrucks] = useCrossTabState('group8', {trucksInfo: defaultTruckInfo}.trucksInfo)

  let component
  switch (window.location.pathname) {
    case "/":
      component = <Home />
      break
    case "/map":
      component = <Map trucks={trucks} setTrucks={setTrucks} />
      break
    case "/database":
      component = <Database trucks={trucks} setTrucks={setTrucks} />
      break
    default:
      component = <Home />
  }

  return (
    <div className="App">
      { component }
    </div>
  )
}

// class App extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       count: 1
//     }
//     this.updateCount = this.updateCount.bind(this)
//   }
//
//   updateCount() {
//     console.log(this.state.count)
//     this.setState({count: this.state.count + 1})
//     console.log(this.state.count)
//   }
//
//   setCount(count) {
//     console.log(this.state.count)
//     this.setState({count: count})
//     console.log(this.state.count)
//   }
//
//   render() {
//     let component
//     switch (window.location.pathname) {
//       case "/":
//         component = <Home />
//         break
//       case "/map":
//         component = <Map updateCount={this.updateCount} />
//         break
//       case "/database":
//         component = <Database updateCount={this.updateCount} />
//         break
//       default:
//         component = <Home />
//     }
//     return (
//       <div className="App">
//         { component }
//         <h2 onClick={ () => this.setCount(0) }>Debug Add Item</h2>
//       </div>
//     )
//   }
// }

export default App;
