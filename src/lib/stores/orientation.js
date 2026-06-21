import { readable } from "svelte/store";

const getRawOrientation = (e) => {
  if (!e) return { alpha: 0, beta: 0, gamma: 0 };
  return { alpha: e.alpha, beta: e.beta, gamma: e.gamma };
};

let firstReading = true;
let baseOrientation = getRawOrientation();
let listenerAdded = false;
let _set = null;

export const resetBaseOrientation = () => {
  firstReading = true;
  baseOrientation = getRawOrientation();
};

const getOrientationObject = (e) => {
  const raw = getRawOrientation(e);
  return {
    absolute: raw,
    relative: {
      alpha: raw.alpha - baseOrientation.alpha,
      beta:  raw.beta  - baseOrientation.beta,
      gamma: raw.gamma - baseOrientation.gamma,
    }
  };
};

const handleOrientation = (e) => {
  if (firstReading) {
    firstReading = false;
    baseOrientation = getRawOrientation(e);
  }
  if (_set) _set(getOrientationObject(e));
};

export const needsOrientationPermission = () =>
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof DeviceOrientationEvent.requestPermission === "function";

const needsPermission = needsOrientationPermission;

const addListener = () => {
  if (!listenerAdded) {
    window.addEventListener("deviceorientation", handleOrientation, true);
    listenerAdded = true;
  }
};

export const orientation = readable(getOrientationObject(), function start(set) {
  _set = set;

  // Android / desktop — no permission needed
  if (!needsPermission()) {
    addListener();
  }

  return function stop() {
    window.removeEventListener("deviceorientation", handleOrientation, true);
    listenerAdded = false;
    _set = null;
  };
});

// Call this from a user gesture (tap) on iOS 13+
export const requestOrientationPermission = async () => {
  if (!needsPermission()) return true;
  try {
    const state = await DeviceOrientationEvent.requestPermission();
    if (state === "granted") addListener();
    return state === "granted";
  } catch {
    return false;
  }
};
