import { UnitValue } from './unit-value.model';

export enum TechniqueStatus {
  Good = 'good',
  Acceptable = 'acceptable',
  Poor = 'poor',
}

export interface TechniqueScorePoint {
  timestamp: Date;
  medicationId: string;

  techniqueScore: number;

  shakeDuration: number;
  inspiratoryTime: number;
  peakInspiratoryFlowRate: number;
  deviceOrientation: number;
  estimatedDeliveredVolume: number;
  score: number;
}

export interface TechniqueThreshold {
  good: UnitValue;
  acceptable: UnitValue;
}

export interface TechniqueThresholds {
  shakeDuration: TechniqueThreshold;
  inspiratoryTime: TechniqueThreshold;
  peakInspiratoryFlowRate: TechniqueThreshold;
  deviceOrientation: TechniqueThreshold;
  estimatedDeliveredVolume: TechniqueThreshold;
}

export const TECHNIQUE_THRESHOLDS: TechniqueThresholds = {
  shakeDuration: {
    good: { value: 3000, unit: 'ms' },
    acceptable: { value: 2000, unit: 'ms' },
  },

  inspiratoryTime: {
    good: { value: 2800, unit: 'ms' },
    acceptable: { value: 2000, unit: 'ms' },
  },

  peakInspiratoryFlowRate: {
    good: { value: 60, unit: 'L/min' },
    acceptable: { value: 45, unit: 'L/min' },
  },

  deviceOrientation: {
    good: { value: 15, unit: 'deg' },
    acceptable: { value: 30, unit: 'deg' },
  },

  estimatedDeliveredVolume: {
    good: { value: 1.8, unit: 'mL' },
    acceptable: { value: 1.2, unit: 'mL' },
  },
};
