export interface DoseEvent {
  id: string;
  medicationId: string;
  timestamp: Date;
  scheduledTime?: string | null;
  technique: TechniqueTelemetry;
}

export interface MissedDoseEvent {
  id: string;
  medicationId: string;
  timestamp: Date;
  scheduledTime: string;
}

export interface TechniqueTelemetry {
  shakeDuration: number;
  inspiratoryTime: number;
  peakInspiratoryFlowRate: number;
  deviceOrientation: number;
  estimatedDeliveredVolume: number;
  techniqueScore: number;
}
