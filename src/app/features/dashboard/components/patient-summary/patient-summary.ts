import { Component, Input } from '@angular/core';
import { MedicationDetail, Patient } from '../../../../models';

@Component({
  selector: 'app-patient-summary',
  imports: [],
  templateUrl: './patient-summary.html',
})
export class PatientSummary {
  @Input({ required: true })
  patient!: Patient;

  @Input({ required: true })
  medication!: MedicationDetail;

  @Input()
  rescueCount: number = 0;

  get missed() {
    return this.medication.missedDoses.length;
  }
}
