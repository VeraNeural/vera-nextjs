// src/lib/sounds/ambient-sounds.ts

export interface AmbientSound {
  id: string;
  name: string;
  file: string;
  description: string;
  attribution?: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    file: '/sounds/rain.mp3',
    description: 'Soft rain for calming',
    attribution: 'freesound.org',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    file: '/sounds/ocean.mp3',
    description: 'Peaceful ocean waves',
    attribution: 'freesound.org',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    file: '/sounds/forest.mp3',
    description: 'Birds chirping in forest',
    attribution: 'freesound.org',
  },
  {
    id: 'wind',
    name: 'Gentle Wind',
    file: '/sounds/wind.mp3',
    description: 'Soft wind through trees',
    attribution: 'freesound.org',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    file: '/sounds/fire.mp3',
    description: 'Cozy fireplace sounds',
    attribution: 'freesound.org',
  },
  {
    id: 'night',
    name: 'Night Ambience',
    file: '/sounds/night.mp3',
    description: 'Peaceful night sounds',
    attribution: 'freesound.org',
  },
];

export const getRandomSound = (): AmbientSound => {
  return AMBIENT_SOUNDS[Math.floor(Math.random() * AMBIENT_SOUNDS.length)];
};

export const getSoundById = (id: string): AmbientSound | undefined => {
  return AMBIENT_SOUNDS.find(sound => sound.id === id);
};
