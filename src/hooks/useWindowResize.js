import { useState, useEffect, useRef, useCallback } from "react";

const useWindowResize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [baseUnit, setBaseUnit] = useState(0);
  const [mobileInfo, setMobileInfo] = useState({
    active: false,
    portrait: false,
    maxHeight: 0,
    chrome: 0,
  });

  const minHeightElRef = useRef(null);
  const maxHeightElRef = useRef(null);
  const svhSupported = useRef(false);

  const getBaseUnit = useCallback((options) => {
    const defaults = { weight: 5, min: 11, max: undefined };
    options = { ...defaults, ...options };
    let base = Math.min(options.width, options.height) / (100 / options.weight);
    if (options.min && base < options.min) base = options.min;
    if (options.max && base > options.max) base = options.max;
    return base;
  }, []);

  const createMeasurementElement = (heightValue) => {
    const el = document.createElement("div");
    el.setAttribute(
      "style",
      `position: fixed; top:0; left:0; z-index:-99; visibility:hidden; height:${heightValue};`
    );
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    return el;
  };

  const calculateHeights = () => {
    const maxHeight = maxHeightElRef.current?.getBoundingClientRect().height || window.innerHeight;
    let minHeight = 0;

    if (svhSupported.current) {
      minHeight = minHeightElRef.current?.getBoundingClientRect().height || window.innerHeight;
    } else {
      let increment = 100;
      minHeight = 0;
      let lastResult;

      while (true) {
        const result = window.matchMedia(`(min-height:${minHeight}px)`).matches;

        if (lastResult !== undefined && result !== lastResult) {
          increment = (increment / 2) * -1;
        }

        minHeight += increment;
        lastResult = result;

        if (Math.abs(increment) < 0.01) {
          minHeight = Math.round(minHeight);
          break;
        }
      }
    }

    return { minHeight, maxHeight };
  };

  const onWindowResize = useCallback(() => {
    if (typeof window === "undefined") return;

    const w = document.documentElement.clientWidth;
    const h = window.innerHeight;

    const { minHeight, maxHeight } = calculateHeights();
    const chrome = maxHeight - minHeight;

    let diff = 0,
      scale = 5,
      weight = 9;

    if (minHeight + chrome > w) diff = (minHeight + chrome) / w - 1;
    diff = diff / 0.777777778;
    if (diff > 1) diff = 1;

    if (mobileInfo.active && !mobileInfo.portrait) weight = 18;

    const baseUnitCalculated = getBaseUnit({
      weight: weight + scale * diff,
      min: 20,
      width: w,
      height: minHeight + chrome,
    });

    const baseSizeMultiplier = mobileInfo.active ? 0.24 : 0.16;
    document.documentElement.style.setProperty("--base-size", `${baseUnitCalculated * baseSizeMultiplier}px`);
    document.documentElement.style.setProperty("--viewport-height", `${h}px`);

    setWindowSize({ width: w, height: h });
    setBaseUnit(baseUnitCalculated);
    setMobileInfo((prev) => ({ ...prev, maxHeight, chrome }));
  }, [getBaseUnit, mobileInfo.active, mobileInfo.portrait]);

  const onMobileChange = useCallback(() => {
    const mobilePortraitMQ = window.matchMedia("(max-aspect-ratio: 4/5)");
    const mobileLandscapeMQ = window.matchMedia("(min-aspect-ratio: 2/3) and (max-height:500px)");

    const isMobile = mobilePortraitMQ.matches || mobileLandscapeMQ.matches;
    const isPortrait = mobilePortraitMQ.matches;

    document.documentElement.classList.toggle("mobile", isMobile);

    setMobileInfo((prev) => {
      if (prev.active !== isMobile || prev.portrait !== isPortrait) {
        setTimeout(onWindowResize, 50);
      }
      return { ...prev, active: isMobile, portrait: isPortrait };
    });
  }, [onWindowResize]);

  useEffect(() => {
    svhSupported.current = CSS.supports("height", "100svh");
    maxHeightElRef.current = createMeasurementElement("100vh");
    if (svhSupported.current) {
      minHeightElRef.current = createMeasurementElement("100svh");
    }

    const mobilePortraitMQ = window.matchMedia("(max-aspect-ratio:4/5)");
    const mobileLandscapeMQ = window.matchMedia("(min-aspect-ratio:2/3) and (max-height:500px)");
    
    mobilePortraitMQ.addEventListener("change", onMobileChange);
    mobileLandscapeMQ.addEventListener("change", onMobileChange);
    window.addEventListener("resize", onWindowResize, { passive: true });

    // Initial run
    onMobileChange();
    onWindowResize();

    return () => {
      mobilePortraitMQ.removeEventListener("change", onMobileChange);
      mobileLandscapeMQ.removeEventListener("change", onMobileChange);
      window.removeEventListener("resize", onWindowResize);
      if (maxHeightElRef.current) document.body.removeChild(maxHeightElRef.current);
      if (minHeightElRef.current) document.body.removeChild(minHeightElRef.current);
    };
  }, [onMobileChange, onWindowResize]);

  return { windowSize, baseUnit, mobileInfo };
};

export default useWindowResize;