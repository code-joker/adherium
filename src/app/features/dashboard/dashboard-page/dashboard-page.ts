import { Component, inject, signal } from '@angular/core';
import {
  DoseEvent,
  Medication,
  MedicationDetail,
  MedicationSchedule,
  MedicationType,
  MissedDoseEvent,
  Patient,
  PatientAdherence,
} from '../../../models';
import { AdherenceService } from '../../../services';
import {
  PatientSummary,
  AdherenceTrendComponent,
  AdherenceGaugeComponent,
  TechniqueTrendComponent,
} from '../components';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    PatientSummary,
    AdherenceGaugeComponent,
    AdherenceTrendComponent,
    TechniqueTrendComponent,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {
  loading = signal(true);

  patientId = 'PAT-2847'; // should not be hardcoded in a real scenario
  medicationId = 'MED-001'; // should not be hardcoded in a real scenario

  patient: Patient | null = null;
  rescueCount = 0;
  medications: MedicationDetail[] = [];
  medication!: MedicationDetail;
  controllerMedications: MedicationDetail[] = [];

  private _adherenceService = inject(AdherenceService);

  ngOnInit() {
    this._adherenceService
      .getMedicationAdherence(this.patientId, this.medicationId)
      .subscribe((data) => {
        this._onAdherenceFetch(data);
      });
  }

  private _onAdherenceFetch(data: PatientAdherence): void {
    this.patient = data.patient;

    const medicationTypeMap = new Map<string, MedicationType>();

    data.medications.forEach((m) => {
      medicationTypeMap.set(m.medicationId, m.medicationType);
    });

    const rescue = data.doseEvents.filter(
      (e) => medicationTypeMap.get(e.medicationId) === MedicationType.Rescue,
    ).length;

    this.rescueCount = rescue;

    this.medications = this._buildMedicationDetails(
      data.medications,
      data.schedules,
      data.doseEvents,
      data.missedDoseEvents,
    );

    this.controllerMedications = this.medications.filter(
      (x) => x.medicationType === MedicationType.Controller,
    );

    this.medication = this.controllerMedications.find((x) => x.medicationId === this.medicationId)!;
    this.loading.set(false);
  }

  private _buildMedicationDetails(
    medications: Medication[],
    schedules: MedicationSchedule[],
    doses: DoseEvent[],
    missedDoses: MissedDoseEvent[],
  ): MedicationDetail[] {
    const schedulesByMedication = new Map<string, MedicationSchedule>();
    const dosesByMedication = new Map<string, DoseEvent[]>();
    const missedDosesByMedication = new Map<string, MissedDoseEvent[]>();

    for (const schedule of schedules) {
      schedulesByMedication.set(schedule.medicationId, schedule);
    }

    for (const dose of doses) {
      if (!dosesByMedication.has(dose.medicationId)) {
        dosesByMedication.set(dose.medicationId, []);
      }
      dosesByMedication.get(dose.medicationId)!.push(dose);
    }

    for (const missed of missedDoses) {
      if (!missedDosesByMedication.has(missed.medicationId)) {
        missedDosesByMedication.set(missed.medicationId, []);
      }
      missedDosesByMedication.get(missed.medicationId)!.push(missed);
    }

    return medications.map((medication): MedicationDetail => {
      const schedule = schedulesByMedication.get(medication.medicationId);

      const doses = dosesByMedication.get(medication.medicationId) ?? [];
      const missedDoses = missedDosesByMedication.get(medication.medicationId) ?? [];

      const taken = doses.length;
      const missed = missedDoses.length;

      const expected = taken + missed;

      return {
        ...medication,
        prescribedDosesPerDay: schedule?.prescribedDosesPerDay ?? 0,
        schedule: schedule?.schedule ?? [],
        doses,
        missedDoses,
        expectedDoses: expected,
        adherence: expected ? Math.round((taken / expected) * 100) : 0,
      };
    });
  }
}
