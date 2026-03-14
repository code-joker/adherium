import { inject, Injectable } from '@angular/core';
import { PatientAdherence } from '../models';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { mapPatientAdherence } from './mapper';

@Injectable({
  providedIn: 'root',
})
export class AdherenceService {
  private _http = inject(HttpClient);

  getMedicationAdherence(patientId: string, medicationId: string): Observable<PatientAdherence> {
    return this._http.get<any>('patient_adherence.json').pipe(map(mapPatientAdherence));
  }
}
