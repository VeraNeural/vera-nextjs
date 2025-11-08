// src/lib/sounds/ambient-sounds.ts

export interface AmbientSound {
  id: string;
  name: string;
  file: string;
  description: string;
  attribution?: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  // Featured Sound
  {
    id: 'guitar_humming',
    name: '🎸 Guitar & Humming',
    file: '/sounds/guitar-humming.mp3',
    description: 'Beautiful guitar with light humming',
    attribution: 'YouTube',
  },
  
  // Basic Nature Sounds
  {
    id: 'rain',
    name: 'Gentle Rain',
    file: '/sounds/rain.mp3',
    description: 'Soft rain for calming',
    attribution: 'Freesound',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    file: '/sounds/ocean.mp3',
    description: 'Peaceful ocean waves',
    attribution: 'Freesound',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    file: '/sounds/forest.mp3',
    description: 'Birds chirping in forest',
    attribution: 'Freesound',
  },
  {
    id: 'wind',
    name: 'Gentle Wind',
    file: '/sounds/wind.mp3',
    description: 'Soft wind through trees',
    attribution: 'Freesound',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    file: '/sounds/fire.mp3',
    description: 'Cozy fireplace sounds',
    attribution: 'Freesound',
  },
  {
    id: 'night',
    name: 'Night Ambience',
    file: '/sounds/night.mp3',
    description: 'Peaceful night sounds',
    attribution: 'Freesound',
  },
  
  // Elevation Series
  {
    id: 'elevation_36201_feet',
    name: '36,201 feet - Year of the Deer',
    file: '/sounds/ES_36,201 feet - Year of the Deer.mp3',
    description: 'Ethereal high-altitude ambience',
    attribution: 'Elevation Series',
  },

  // ASMR & Sensory
  {
    id: 'asmr_morning_birdlife',
    name: 'ASMR Morning Birdlife',
    file: '/sounds/ES_ASMR Morning Birdlife - Autonomic Sensations.mp3',
    description: 'Gentle morning bird sounds for sensory relaxation',
    attribution: 'Autonomic Sensations',
  },
  {
    id: 'asmr_rain_maker',
    name: 'ASMR Rain Maker',
    file: '/sounds/ES_ASMR Rain Maker - Bruce Brus.mp3',
    description: 'Rain ambience with ASMR textures',
    attribution: 'Bruce Brus',
  },
  {
    id: 'bubble_wrappings',
    name: 'Bubble Wrappings',
    file: '/sounds/ES_Bubble Wrappings - Autonomic Sensations.mp3',
    description: 'Satisfying bubble wrap sounds for relaxation',
    attribution: 'Autonomic Sensations',
  },

  // Meditation & Healing
  {
    id: 'calm_binaural',
    name: 'Calm Binaural Meditation',
    file: '/sounds/ES_Calm Binaural Meditation - Swedish Sound Therapy.mp3',
    description: 'Binaural beats for deep relaxation',
    attribution: 'Swedish Sound Therapy',
  },
  {
    id: 'consolations',
    name: 'Consolations',
    file: '/sounds/ES_Consolations - Ryan James Carr.mp3',
    description: 'Soothing emotional support soundscape',
    attribution: 'Ryan James Carr',
  },

  // Atmospheric & Cinematic
  {
    id: 'awakened_force',
    name: 'Awakened Force',
    file: '/sounds/ES_Awakened Force - Ruiqi Zhao.mp3',
    description: 'Powerful, grounding ambient energy',
    attribution: 'Ruiqi Zhao',
  },
  {
    id: 'dox',
    name: 'DOX',
    file: '/sounds/ES_DOX - Lennon Hutton.mp3',
    description: 'Intense atmospheric soundscape',
    attribution: 'Lennon Hutton',
  },
  {
    id: 'drainpipe_rain',
    name: 'Drainpipe Looping in the Rain',
    file: '/sounds/ES_Drainpipe Looping in the Rain - Sonic Observations.mp3',
    description: 'Urban rain ambience with drainpipe texture',
    attribution: 'Sonic Observations',
  },
  {
    id: 'drone_tension',
    name: 'Drone of Tension',
    file: '/sounds/ES_Drone of Tension - Elm Lake.mp3',
    description: 'Deep drone for focus and concentration',
    attribution: 'Elm Lake',
  },

  // Music & Movement
  {
    id: 'home_for_night',
    name: 'Home for the Night',
    file: '/sounds/ES_Home for the Night - Mizlo.mp3',
    description: 'Warm, cozy evening ambient music',
    attribution: 'Mizlo',
  },
  {
    id: 'inverted_hail',
    name: 'Inverted Hail',
    file: '/sounds/ES_Inverted Hail - Luba Hilman.mp3',
    description: 'Ethereal, reversed storm ambience',
    attribution: 'Luba Hilman',
  },
  {
    id: 'lift_off',
    name: 'LIFT OFF',
    file: '/sounds/ES_LIFT OFF - Ballpoint.mp3',
    description: 'Energizing, uplifting soundscape',
    attribution: 'Ballpoint',
  },
  {
    id: 'momentum_quake',
    name: 'Momentum: I. Quake',
    file: '/sounds/ES_Momentum_ I. Quake - Dian Shuai.mp3',
    description: 'Dynamic, powerful momentum build',
    attribution: 'Dian Shuai',
  },

  // Inspirational & Motivational
  {
    id: 'never_stop_reaching',
    name: 'Never Stop Reaching for the Stars',
    file: '/sounds/ES_Never Stop Reaching for the Stars - Airae.mp3',
    description: 'Inspiring, uplifting ambient journey',
    attribution: 'Airae',
  },

  // Sensory & Coffee Shop
  {
    id: 'morning_coffee',
    name: 'Smell of Morning Coffee',
    file: '/sounds/ES_Smell of Morning Coffee - Franz Gordon.mp3',
    description: 'Cozy cafe ambience for focus',
    attribution: 'Franz Gordon',
  },

  // Gentle & Subtle
  {
    id: 'subtle_movement',
    name: 'Subtle Movement',
    file: '/sounds/ES_Subtle Movement - Loyae.mp3',
    description: 'Delicate, flowing ambient texture',
    attribution: 'Loyae',
  },

  // Travel & Places
  {
    id: 'sunny_sf',
    name: 'Sunny San Francisco',
    file: '/sounds/ES_Sunny San Francisco - Oakwood Station.mp3',
    description: 'Golden hour urban ambience',
    attribution: 'Oakwood Station',
  },

  // Nostalgic & Melancholic
  {
    id: 'forgotten_carousel',
    name: 'The Forgotten Rusty Carousel',
    file: '/sounds/ES_The Forgotten Rusty Carousel - Stationary Sign.mp3',
    description: 'Nostalgic, bittersweet memories',
    attribution: 'Stationary Sign',
  },
  {
    id: 'oak_tree',
    name: 'The Oak Tree',
    file: '/sounds/ES_The Oak Tree - Jakob Ahlbom.mp3',
    description: 'Ancient, grounding forest presence',
    attribution: 'Jakob Ahlbom',
  },

  // Weather & Atmosphere
  {
    id: 'thoughts_rain',
    name: 'Thoughts in the Rain',
    file: '/sounds/ES_Thoughts in the Rain - Elm Lake.mp3',
    description: 'Reflective rain ambience for introspection',
    attribution: 'Elm Lake',
  },
  {
    id: 'weatherscape',
    name: 'Weatherscape',
    file: '/sounds/ES_Weatherscape - Fizzonaut.mp3',
    description: 'Dynamic weather patterns and transitions',
    attribution: 'Fizzonaut',
  },

  // World & Cultural
  {
    id: 'vael',
    name: 'Vael',
    file: '/sounds/ES_Vael - Bonsaye.mp3',
    description: 'Global ambient fusion',
    attribution: 'Bonsaye',
  },
  {
    id: 'waltz_dead',
    name: 'Waltz of the Dead',
    file: '/sounds/ES_Waltz of the Dead - Mike Franklyn.mp3',
    description: 'Mysterious, haunting waltz',
    attribution: 'Mike Franklyn',
  },
  {
    id: 'yami_ichi',
    name: 'Yami Ichi (Black Market)',
    file: '/sounds/ES_Yami Ichi (Black Market) - Isaku Kageyama.mp3',
    description: 'Atmospheric urban Japanese sound',
    attribution: 'Isaku Kageyama',
  },
];

export const getRandomSound = (): AmbientSound => {
  return AMBIENT_SOUNDS[Math.floor(Math.random() * AMBIENT_SOUNDS.length)];
};

export const getSoundById = (id: string): AmbientSound | undefined => {
  return AMBIENT_SOUNDS.find(sound => sound.id === id);
};
