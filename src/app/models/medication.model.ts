import { Code } from './code.model';
import { DoseEvent, MissedDoseEvent } from './dose.model';
import { UnitValue } from './unit-value.model';

export enum MedicationType {
  Controller = 'controller',
  Rescue = 'rescue',
}

export interface Medication {
  medicationId: string;
  medicationName: string;
  medicationType: MedicationType;
  route: string;
  strength: UnitValue;
  code: Code;
}

export interface MedicationSchedule {
  medicationId: string;
  prescribedDosesPerDay: number;
  schedule: ScheduleTime[];
}

export interface ScheduleTime {
  scheduledTime: string;
  windowBefore: number;
  windowAfter: number;
}

export interface MedicationDetail extends Medication {
  prescribedDosesPerDay: number;
  schedule: ScheduleTime[];
  doses: DoseEvent[];
  missedDoses: MissedDoseEvent[];
  adherence: number;
  expectedDoses: number;
}
