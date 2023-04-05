import React, {useCallback, useEffect, useState} from "react";
import Maps, {computeDistance, interpolate} from "react-maps-suite";

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

const defaultCenter = {
  lat: 43.394452,
  lng: -80.493500
};

const defaultPath = [
  { lat: 44.752347, lng: -79.495547 },
  { lat: 44.241208, lng: -82.268736 },
  { lat: 43.099234, lng: -84.163449 },
].reduce((result, item, index, array) => {
  if (index === 0) {
    result.push({ ...item, distance: 0 });
    return result;
  }

  const { distance: lastDistance } = result[index - 1];
  const previous = array[index - 1];
  const distance = lastDistance + computeDistance(previous, item);

  result.push({ ...item, distance });
  return result;
}, []);

const defaultZoom= 6;

const DEFAULT_SPEED= 100; // m/s

function Map() {
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

  const distance = DEFAULT_SPEED * time;
  const position = getPositionAt(defaultPath, distance);

  return (
    <Maps
      provider="google"
      height={400}
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
    >
      <Maps.Marker position={position} />
    </Maps>
  );
}
export default Map;