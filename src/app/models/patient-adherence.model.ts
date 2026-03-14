import { DoseEvent, MissedDoseEvent } from './dose.model';
import { Medication, MedicationSchedule } from './medication.model';
import { Patient } from './patient.model';

export interface PatientAdherence {
  patient: Patient;
  medications: Medication[];
  schedules: MedicationSchedule[];
  doseEvents: DoseEvent[];
  missedDoseEvents: MissedDoseEvent[];
}
