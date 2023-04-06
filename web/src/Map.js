import React, {useCallback, useEffect, useState} from "react";
import Maps, {computeDistance, interpolate} from "react-maps-suite";

const defaultCenter = {
  lat: 43.394452,
  lng: -80.493500
};

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

const defaultZoom= 8;

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
  const [trucksFromRanchToFarm, setTrucksFromRanchToFarm] = useState([0, 0, 0]);
  const [trucksFromFarmToRanch, setTrucksFromFarmToRanch] = useState([0, 0, 0]);
  const [trucksFromFarmToCannery, setTrucksFromFarmToCannery] = useState([0, 0, 0]);
  const [trucksFromRanchToCannery, setTrucksFromRanchToCannery] = useState([0, 0, 0]);
  const updateTrucksFromRanchToFarm = useCallback((truckNumber, distance) => {
    setTrucksFromRanchToFarm(trucksFromRanchToFarm => {
      trucksFromRanchToFarm[truckNumber] = distance;
      return [...trucksFromRanchToFarm];
    });
  }, []);
  const updateTrucksFromFarmToRanch = useCallback((truckNumber, distance) => {
    setTrucksFromFarmToRanch(trucksFromFarmToRanch => {
      trucksFromFarmToRanch[truckNumber] = distance;
      return [...trucksFromFarmToRanch];
    });
  }, []);
  const updateTrucksFromFarmToCannery = useCallback((truckNumber, distance) => {
    setTrucksFromFarmToCannery(trucksFromFarmToCannery => {
      trucksFromFarmToCannery[truckNumber] = distance;
      return [...trucksFromFarmToCannery];
    });
  }, []);
  const updateTrucksFromRanchToCannery = useCallback((truckNumber, distance) => {
    setTrucksFromRanchToCannery(trucksFromRanchToCannery => {
      trucksFromRanchToCannery[truckNumber] = distance;
      return [...trucksFromRanchToCannery];
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

      updateTrucksFromRanchToFarm(i, trucksFromRanchToFarm[i] + speedOfTruckFromRanchToFarm);
      updateTrucksFromFarmToRanch(i, trucksFromFarmToRanch[i] + speedOfTruckFromFarmToRanch);
      updateTrucksFromFarmToCannery(i, trucksFromFarmToCannery[i] + speedOfTruckFromFarmToCannery);
      updateTrucksFromRanchToCannery(i, trucksFromRanchToCannery[i] + speedOfTruckFromRanchToCannery);
    }
  }, [time]);

  const markers = [];
  for (let i = 0; i < 3; i++) {
    markers.push(
      <Maps.Marker
        key={i}
        position={getPositionAt(ranch2FarmPath, trucksFromRanchToFarm[i])}
        onClick={() => { console.log('clicked'); }}
      />
    );
    markers.push(<Maps.Marker key={i + 3} position={getPositionAt(farm2RanchPath, trucksFromFarmToRanch[i])} />);
    markers.push(<Maps.Marker key={i + 6} position={getPositionAt(farm2CanneryPath, trucksFromFarmToCannery[i])} />);
    markers.push(<Maps.Marker key={i + 9} position={getPositionAt(ranch2CanneryPath, trucksFromRanchToCannery[i])} />);
  }

  return (
    <div className="Map">
      <Maps
        provider="google"
        height='100vh'
        width='100vw'
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
      >
        {/*<Maps.Popup position={ranchPosition}>*/}
        {/*  <div>Ranch</div>*/}
        {/*</Maps.Popup>*/}
        { markers }
        <Maps.Polyline path={ranch2CanneryPath} strokeColor="#fc0a08" />
        <Maps.Polyline path={farm2CanneryPath} strokeColor="#0868fc" />
        <Maps.Polyline path={ranch2FarmPath} strokeColor="#fc9c08" />
      </Maps>
    </div>
  );
}
export default Map;