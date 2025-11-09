/**
 * BIOMETRIC INTEGRATION v5.0
 * 
 * Real-time nervous system state detection via wearables
 * 
 * @author VeraNeural
 * @date 2025-11-08 21:57:59 UTC
 */

export interface BiometricReading {
  timestamp: Date;
  heartRate?: number;
  hrv?: number; // Heart Rate Variability
  respirationRate?: number;
  skinTemperature?: number;
  oxygenSaturation?: number;
  stressLevel?: number; // 0-100
  sleepStage?: 'awake' | 'light' | 'deep' | 'rem';
}

export interface BiometricAnalysis {
  nervousSystemState: 'ventral' | 'sympathetic' | 'dorsal';
  confidence: number;
  indicators: string[];
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Analyze biometric data for nervous system state
 */
export function analyzeBiometrics(
  reading: BiometricReading,
  historicalData?: BiometricReading[]
): BiometricAnalysis {
  const indicators: string[] = [];
  let sympatheticScore = 0;
  let dorsalScore = 0;
  let ventralScore = 0;

  // Heart Rate Analysis
  if (reading.heartRate) {
    if (reading.heartRate > 90) {
      sympatheticScore += 30;
      indicators.push('Elevated heart rate (sympathetic activation)');
    } else if (reading.heartRate < 55) {
      dorsalScore += 25;
      indicators.push('Low heart rate (possible dorsal state)');
    } else {
      ventralScore += 20;
      indicators.push('Heart rate in normal range (ventral)');
    }
  }

  // HRV Analysis (lower HRV = more stress)
  if (reading.hrv) {
    if (reading.hrv < 30) {
      sympatheticScore += 35;
      indicators.push('Low HRV (high stress/sympathetic)');
    } else if (reading.hrv > 60) {
      ventralScore += 30;
      indicators.push('High HRV (parasympathetic/ventral)');
    } else {
      sympatheticScore += 10;
      indicators.push('Moderate HRV (mild activation)');
    }
  }

  // Respiration Rate
  if (reading.respirationRate) {
    if (reading.respirationRate > 20) {
      sympatheticScore += 20;
      indicators.push('Rapid breathing (anxiety/activation)');
    } else if (reading.respirationRate < 10) {
      dorsalScore += 20;
      indicators.push('Shallow breathing (shutdown)');
    } else {
      ventralScore += 15;
      indicators.push('Normal breathing rate');
    }
  }

  // Skin Temperature
  if (reading.skinTemperature) {
    if (reading.skinTemperature < 32) {
      sympatheticScore += 15;
      indicators.push('Cold extremities (fight/flight)');
    }
  }

  // Determine state
  let state: 'ventral' | 'sympathetic' | 'dorsal';
  const maxScore = Math.max(sympatheticScore, dorsalScore, ventralScore);
  
  if (maxScore === 0) {
    // No biometric data provided
    return {
      nervousSystemState: 'ventral',
      confidence: 0,
      indicators: ['No biometric data available'],
      trend: 'stable',
    };
  }
  
  if (maxScore === sympatheticScore) {
    state = 'sympathetic';
  } else if (maxScore === dorsalScore) {
    state = 'dorsal';
  } else {
    state = 'ventral';
  }

  // Normalize confidence to 0-100
  const normalizedConfidence = Math.min(maxScore, 100);

  // Calculate trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (historicalData && historicalData.length > 3) {
    const recent = historicalData.slice(-3);
    const avgHRV = recent.reduce((sum, r) => sum + (r.hrv || 0), 0) / 3;
    if (reading.hrv && reading.hrv > avgHRV + 5) trend = 'improving';
    if (reading.hrv && reading.hrv < avgHRV - 5) trend = 'declining';
  }

  return {
    nervousSystemState: state,
    confidence: normalizedConfidence,
    indicators,
    trend,
  };
}

/**
 * Merge biometric state with text-based analysis
 */
export function mergeBiometricWithTextAnalysis(
  biometricState: BiometricAnalysis,
  textBasedState: 'ventral' | 'sympathetic' | 'dorsal',
  textConfidence: number
): { 
  finalState: 'ventral' | 'sympathetic' | 'dorsal'; 
  confidence: number; 
  method: string;
  rationale: string;
} {
  // Biometric data has priority if confidence is high
  if (biometricState.confidence > 70) {
    return {
      finalState: biometricState.nervousSystemState,
      confidence: biometricState.confidence,
      method: 'biometric_primary',
      rationale: 'Biometric data shows strong signal',
    };
  }

  // Text analysis priority if confidence is high
  if (textConfidence > 70) {
    return {
      finalState: textBasedState,
      confidence: textConfidence,
      method: 'text_primary',
      rationale: 'Text analysis shows strong signal',
    };
  }

  // Consensus - both agree
  if (biometricState.nervousSystemState === textBasedState) {
    return {
      finalState: biometricState.nervousSystemState,
      confidence: (biometricState.confidence + textConfidence) / 2,
      method: 'consensus',
      rationale: 'Biometric and text analysis align',
    };
  }

  // Disagreement - use higher confidence
  if (biometricState.confidence > textConfidence) {
    return {
      finalState: biometricState.nervousSystemState,
      confidence: biometricState.confidence,
      method: 'biometric_override',
      rationale: 'Biometric confidence higher than text',
    };
  } else {
    return {
      finalState: textBasedState,
      confidence: textConfidence,
      method: 'text_override',
      rationale: 'Text confidence higher than biometric',
    };
  }
}

/**
 * Connect to Fitbit API
 */
export async function fetchFitbitData(accessToken: string): Promise<BiometricReading> {
  try {
    const heartResponse = await fetch(
      'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const heartData = await heartResponse.json();

    const hrvResponse = await fetch(
      'https://api.fitbit.com/1/user/-/hrv/date/today.json',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const hrvData = await hrvResponse.json();

    return {
      timestamp: new Date(),
      heartRate: heartData['activities-heart']?.[0]?.value?.restingHeartRate,
      hrv: hrvData.hrv?.[0]?.value?.dailyRmssd,
    };
  } catch (error) {
    console.error('[Biometric] Fitbit API error:', error);
    throw error;
  }
}

/**
 * Connect to Oura Ring API
 */
export async function fetchOuraData(accessToken: string): Promise<BiometricReading> {
  try {
    const response = await fetch(
      'https://api.ouraring.com/v2/usercollection/daily_readiness',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await response.json();
    const latest = data.data[0];

    return {
      timestamp: new Date(latest.day),
      heartRate: latest.contributors?.resting_heart_rate,
      hrv: latest.contributors?.hrv_balance,
      sleepStage: 'awake',
    };
  } catch (error) {
    console.error('[Biometric] Oura API error:', error);
    throw error;
  }
}

/**
 * Simulate biometric data (for testing/demo)
 */
export function generateSimulatedBiometrics(
  nervousSystemState: 'ventral' | 'sympathetic' | 'dorsal'
): BiometricReading {
  const baseHR = nervousSystemState === 'sympathetic' ? 95 : 
                 nervousSystemState === 'dorsal' ? 55 : 72;
  const baseHRV = nervousSystemState === 'sympathetic' ? 25 : 
                  nervousSystemState === 'dorsal' ? 35 : 65;

  return {
    timestamp: new Date(),
    heartRate: baseHR + Math.random() * 10 - 5,
    hrv: baseHRV + Math.random() * 10 - 5,
    respirationRate: nervousSystemState === 'sympathetic' ? 22 : 
                     nervousSystemState === 'dorsal' ? 9 : 14,
    skinTemperature: nervousSystemState === 'sympathetic' ? 31 : 34,
  };
}