import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Howl, Howler } from 'howler';
import kickSound from '../assets/sounds/kick.wav';
import snareSound from '../assets/sounds/snare.wav';
import clapSound from '../assets/sounds/clap.wav';
import closedHatSound from '../assets/sounds/closed.wav';
import openHatSound from '../assets/sounds/open.wav';
import cymbalSound from '../assets/sounds/cymbal.wav';
// Import SVG icons
import QIcon from '../assets/images/Q.svg';
import WIcon from '../assets/images/W.svg';
import EIcon from '../assets/images/E.svg';
import RIcon from '../assets/images/R.svg';
import TIcon from '../assets/images/T.svg';
import YIcon from '../assets/images/Y.svg';

const DrumMachine = () => {
  const [activeKeys, setActiveKeys] = useState({});

  useEffect(() => {
    Howler.volume(1.0);
    return () => {
      Howler.unload();
    };
  }, []);

  const sounds = useMemo(
    () => ({
      q: new Howl({
        src: [kickSound],
        volume: 1.0,
        html5: true
      }),
      w: new Howl({
        src: [snareSound],
        volume: 1.0,
        html5: true
      }),
      e: new Howl({
        src: [clapSound],
        volume: 1.0,
        html5: true
      }),
      r: new Howl({
        src: [closedHatSound],
        volume: 1.0,
        html5: true
      }),
      t: new Howl({
        src: [openHatSound],
        volume: 1.0,
        html5: true
      }),
      y: new Howl({
        src: [cymbalSound],
        volume: 1.0,
        html5: true
      }),
    }),
    []
  );

  const playSound = useCallback(
    (key) => {
      const sound = sounds[key.toLowerCase()];
      if (sound) {
        sound.stop();
        sound.play();
      }
    },
    [sounds]
  );

  const triggerKeyAnimation = useCallback((key) => {
    setActiveKeys((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setActiveKeys((prev) => ({ ...prev, [key]: false }));
    }, 150);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key.toLowerCase();
      if (key in sounds && !e.repeat) {
        playSound(key);
        triggerKeyAnimation(key);
      }
    },
    [playSound, triggerKeyAnimation, sounds]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      Object.values(sounds).forEach(sound => sound.unload());
    };
  }, [handleKeyDown, sounds]);

  const keys = [
    { key: "Q", icon: QIcon },
    { key: "W", icon: WIcon },
    { key: "E", icon: EIcon },
    { key: "R", icon: RIcon },
    { key: "T", icon: TIcon },
    { key: "Y", icon: YIcon }
  ];

  return (
    <div className="flex flex-wrap justify-between md:justify-start gap-2 w-full md:max-w-fit">
      {keys.map(({ key, icon }) => (
        <button
          key={key}
          onClick={() => {
            playSound(key.toLowerCase());
            triggerKeyAnimation(key.toLowerCase());
          }}
          className={`
            w-14 md:w-20 h-14 md:h-20 flex flex-col items-center justify-center
            bg-[#1c1f26] text-white dark:bg-[#2a2f3a] dark:text-white
            rounded-lg relative
            transition-all duration-150
            ${activeKeys[key.toLowerCase()] ? 'transform scale-95 opacity-75' : ''}
          `}
        >
          {activeKeys[key.toLowerCase()] && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full opacity-80"></span>
          )}
          <img 
            src={icon} 
            alt={`${key} icon`} 
            className="w-7 md:w-8 h-7 md:h-8 mb-1 object-contain"
          />
          <span className="text-[16px] md:text-[16pt] hidden md:block">{key}</span>
        </button>
      ))}
    </div>
  );
};

export default DrumMachine;