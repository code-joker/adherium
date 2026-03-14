import { Code } from './code.model';

export interface Patient {
  externalId: string;
  initials: string;
  age: number;
  condition: PatientCondition;
}

export interface PatientCondition {
  name: string;
  code: Code;
}
