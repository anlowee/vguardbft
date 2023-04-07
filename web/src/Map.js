import React, {useCallback, useEffect, useState} from "react";
import Maps, {computeDistance, interpolate} from "react-maps-suite";

const ranchPosition = { lat: 43.645152, lng: -79.374808 }
const farmPosition = { lat: 42.969881, lng: -81.245908 }
const canneryPosition = { lat: 42.954596, lng: -79.855055 }

const ranch2FarmPath = [
  ranchPosition,
  { lat: 43.440998, lng: -80.488945 },
  farmPosition,
].reduce(reducePath, []);
const farm2RanchPath = [
  farmPosition,
  { lat: 43.440998, lng: -80.488945 },
  ranchPosition,
].reduce(reducePath, []);
const farm2CanneryPath = [
  farmPosition,
  { lat: 42.868654, lng: -80.308678 },
  canneryPosition,
].reduce(reducePath, []);
const ranch2CanneryPath = [
  ranchPosition,
  { lat: 43.248315, lng: -79.886457 },
  canneryPosition,
].reduce(reducePath, []);

const defaultCenter = {
  lat: 43.141096,
  lng: -80.261403
};
const defaultZoom= 9;

const defaultBooths = [
  [-1, -1, -1],
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
]
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
    cargoType: 'Manure',
    cargoAmount: 2000,
    fromAddr: 'Ranch',
    toAddr: 'Farm',
    boothIndex: 1,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 2,
    cargoType: 'Manure',
    cargoAmount: 1500,
    fromAddr: 'Ranch',
    toAddr: 'Farm',
    boothIndex: 1,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 3,
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
    truckNumber: 4,
    cargoType: 'Corn',
    cargoAmount: 7000,
    fromAddr: 'Farm',
    toAddr: 'Ranch',
    boothIndex: 2,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 5,
    cargoType: 'Corn',
    cargoAmount: 12000,
    fromAddr: 'Farm',
    toAddr: 'Ranch',
    boothIndex: 2,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 6,
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
    truckNumber: 7,
    cargoType: 'Pineapple',
    cargoAmount: 5500,
    fromAddr: 'Farm',
    toAddr: 'Cannery',
    boothIndex: 3,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 8,
    cargoType: 'Pineapple',
    cargoAmount: 6000,
    fromAddr: 'Farm',
    toAddr: 'Cannery',
    boothIndex: 3,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 9,
    cargoType: 'Meat',
    cargoAmount: 1000,
    fromAddr: 'Ranch',
    toAddr: 'Cannery',
    boothIndex: 4,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 10,
    cargoType: 'Meat',
    cargoAmount: 1500,
    fromAddr: 'Ranch',
    toAddr: 'Cannery',
    boothIndex: 4,
    distance: 0,
    progress: '0%',
    isBooked: false,
  },
  {
    truckNumber: 11,
    cargoType: 'Meat',
    cargoAmount: 2000,
    fromAddr: 'Ranch',
    toAddr: 'Cannery',
    boothIndex: 4,
    distance: 0,
    progress: '0%',
    isBooked: false,
  }
]

function getProgress(path, distance) {
  const indexesPassed = path.filter((position) => position.distance < distance);
  if (indexesPassed.length === 0) {
    return 0;// starting position
  }

  const lastIndexPassed = indexesPassed.length - 1;
  const nextIndexToPass = lastIndexPassed + 1;

  const lastPosition = path[lastIndexPassed];
  const nextPosition = path[nextIndexToPass];

  if (!nextPosition) {
    return 1; // distance is greater than the ones we have in the array
  }

  return (distance - lastPosition.distance) / nextPosition.distance;
}
function getPositionAt(path, distance) {
  const indexesPassed = path.filter((position) => position.distance < distance);
  if (indexesPassed.length === 0) {
    return path[0];// starting position
  }

  const lastIndexPassed = indexesPassed.length - 1;
  const nextIndexToPass = lastIndexPassed + 1;

  const lastPosition = path[lastIndexPassed];
  const nextPosition = path[nextIndexToPass];

  if (!nextPosition) {
    return lastPosition; // distance is greater than the ones we have in the array
  }

  const progressUntilNext = // a number from 0 to 1
    (distance - lastPosition.distance) / nextPosition.distance;

  return interpolate(
    lastPosition,
    nextPosition,
    progressUntilNext
  );
}

function reducePath(result, item, index, array) {
  if (index === 0) {
    result.push({ ...item, distance: 0 });
    return result;
  }

  const { distance: lastDistance } = result[index - 1];
  const previous = array[index - 1];
  const distance = lastDistance + computeDistance(previous, item);

  result.push({ ...item, distance });
  return result;
}

function Map() {
  const [trucks, setTrucks] = useState(defaultTruckInfo);
  const updateTruck = useCallback((truckNumber, distance, progress) => {
    setTrucks(trucks => {
      const truck = trucks.find(truck => truck.truckNumber === truckNumber);
      truck.distance = distance;
      truck.progress = (progress * 100).toFixed(2) + '%';
      return [...trucks];
    });
  }, []);

  const [time, setTime] = useState(0);
  const increaseTime = useCallback(() => {
    setTime(time => time + 1);
  }, []);

  useEffect(() => {
    const interval = setInterval(increaseTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [increaseTime]);

  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      const speedOfTruckFromRanchToFarm = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
      const speedOfTruckFromFarmToRanch = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
      const speedOfTruckFromFarmToCannery = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
      const speedOfTruckFromRanchToCannery = Math.floor(Math.random() * (1000 - 500 + 1)) + 500;

      updateTruck(i, trucks[i]['distance'] + speedOfTruckFromRanchToFarm, getProgress(ranch2FarmPath, trucks[i]['distance'] + speedOfTruckFromRanchToFarm) );
      updateTruck(i + 3, trucks[i + 3]['distance'] + speedOfTruckFromFarmToRanch, getProgress(farm2RanchPath, trucks[i + 3]['distance'] + speedOfTruckFromFarmToRanch) );
      updateTruck(i + 6, trucks[i + 6]['distance'] + speedOfTruckFromFarmToCannery, getProgress(farm2CanneryPath, trucks[i + 6]['distance'] + speedOfTruckFromFarmToCannery) );
      updateTruck(i + 9, trucks[i + 9]['distance'] + speedOfTruckFromRanchToCannery, getProgress(ranch2CanneryPath, trucks[i + 9]['distance'] + speedOfTruckFromRanchToCannery) );
    }
  }, [time]);

  const [currentTruck, setCurrentTruck] = useState({
    truckNumber: -1,
    cargoType: 'Please click on a truck',
    cargoAmount: -1,
    fromAddr: 'Please click on a truck',
    toAddr: 'Please click on a truck',
    boothIndex: 0,
    progress: 'Please click on a truck',
    isBooked: false,
  });
  const handleClicked = useCallback((index) => {
    setCurrentTruck(trucks[index]);
    console.log(trucks[index]);
  }, []);

  const markers = [];
  for (let i = 0; i < 3; i++) {
    markers.push(
      <Maps.Marker
        key={i}
        position={getPositionAt(ranch2FarmPath, trucks[i]['distance'])}
        onClick={ () => handleClicked(i) }
      />
    );
    markers.push(
      <Maps.Marker
        key={i + 3}
        position={getPositionAt(farm2RanchPath, trucks[i]['distance'])}
        onClick={ () => handleClicked(i + 3) }
      />);
    markers.push(
      <Maps.Marker
        key={i + 6}
        position={getPositionAt(farm2CanneryPath, trucks[i]['distance'])}
        onClick={ () => handleClicked(i + 6) }
      />);
    markers.push(
      <Maps.Marker
        key={i + 9}
        position={getPositionAt(ranch2CanneryPath, trucks[i]['distance'])}
        onClick={ () => handleClicked(i + 9) }
      />);
  }

  return (
    <div>
      <Maps
        provider="google"
        height='90vh'
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
      >
        { markers }
        <Maps.Polyline path={ranch2CanneryPath} strokeColor="#fc0a08" />
        <Maps.Polyline path={farm2CanneryPath} strokeColor="#0868fc" />
        <Maps.Polyline path={ranch2FarmPath} strokeColor="#fc9c08" />
      </Maps>
      <div style={{height: '10vh'}}>
        <b>Truck #:</b> {currentTruck.truckNumber}&nbsp;<b>Cargo Type:</b> {currentTruck.cargoType}&nbsp;<b>Cargo Amount:</b> {currentTruck.cargoAmount}&nbsp;<b>From:</b> {currentTruck.fromAddr}&nbsp;<b>To:</b> {currentTruck.toAddr}&nbsp;<b>Progress:</b> {currentTruck.progress}&nbsp;<b>Is booked:</b> {currentTruck.isBooked ? 'Yes' : 'No'}
        <br /><b>Current Booth:</b>&nbsp;{
        defaultBooths[currentTruck.boothIndex].map((booth, index) => {
          return (
            <span key={index}>
              truck#{booth}
              {index !== defaultBooths[currentTruck.boothIndex].length - 1 ? ', ' : ''}
            </span>
          );
        })
      }
      </div>
    </div>
  );
}
export default Map;