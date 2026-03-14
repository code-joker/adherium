import {
  PatientAdherence,
  Patient,
  Medication,
  MedicationSchedule,
  ScheduleTime,
  DoseEvent,
  MissedDoseEvent,
  TechniqueTelemetry,
  TechniqueThreshold,
  TechniqueThresholds,
} from '../models';

export function mapPatientAdherence(data: any): PatientAdherence {
  return {
    patient: mapPatient(data.patient),
    medications: data.medications.map(mapMedication),
    schedules: data.medication_schedules.map(mapSchedule),
    doseEvents: data.dose_events.map(mapDoseEvent),
    missedDoseEvents: data.missed_dose_events.map(mapMissedDoseEvent),
  };
}

function mapPatient(data: any): Patient {
  return {
    externalId: data.external_id,
    initials: data.demographics.initials,
    age: data.demographics.age.value,
    condition: {
      name: data.condition.name,
      code: data.condition.code,
    },
  };
}

function mapMedication(item: any): Medication {
  const body = item.body;

  return {
    medicationId: body.medication_id,
    medicationName: body.medication_name,
    medicationType: body.medication_type,
    route: body.route,
    strength: body.strength,
    code: body.medication_code,
  };
}

function mapSchedule(item: any): MedicationSchedule {
  const body = item.body;

  return {
    medicationId: body.medication_id,
    prescribedDosesPerDay: body.prescribed_doses_per_day,
    schedule: body.schedule.map(mapScheduleTime),
  };
}

function mapScheduleTime(item: any): ScheduleTime {
  return {
    scheduledTime: item.scheduled_time,
    windowBefore: item.time_window.window_before.value,
    windowAfter: item.time_window.window_after.value,
  };
}

function mapDoseEvent(item: any): DoseEvent {
  const body = item.body;

  return {
    id: item.header.id,
    medicationId: body.medication_id,
    timestamp: new Date(body.effective_time_frame.date_time),
    scheduledTime: body.scheduled_time,
    technique: mapTechnique(body['adherium:inhaler_technique_telemetry']),
  };
}

function mapMissedDoseEvent(item: any): MissedDoseEvent {
  const body = item.body;

  return {
    id: item.header.id,
    medicationId: body.medication_id,
    timestamp: new Date(body.effective_time_frame.date_time),
    scheduledTime: body.scheduled_time,
  };
}

function mapTechnique(data: any): TechniqueTelemetry {
  return {
    shakeDuration: data.shake_duration.value,
    inspiratoryTime: data.inspiratory_time.value,
    peakInspiratoryFlowRate: data.peak_inspiratory_flow_rate.value,
    deviceOrientation: data.device_orientation.value,
    estimatedDeliveredVolume: data.estimated_delivered_volume.value,
    techniqueScore: data.technique_score,
  };
}

export function mapTechniqueThresholds(data: any): TechniqueThresholds {
  const t = data.technique_thresholds;

  return {
    shakeDuration: mapThreshold(t.shake_duration),
    inspiratoryTime: mapThreshold(t.inspiratory_time),
    peakInspiratoryFlowRate: mapThreshold(t.peak_inspiratory_flow_rate),
    deviceOrientation: mapThreshold(t.device_orientation),
    estimatedDeliveredVolume: mapThreshold(t.estimated_delivered_volume),
  };
}

function mapThreshold(data: any): TechniqueThreshold {
  return {
    good: data.good,
    acceptable: data.acceptable,
  };
}
