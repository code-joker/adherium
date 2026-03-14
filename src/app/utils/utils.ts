import { DoseEvent, TECHNIQUE_THRESHOLDS, TechniqueThreshold } from '../models';

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

export function doseTooltip(dose: DoseEvent): string[] {
  const date = new Date(dose.timestamp);
  const hour = date.getUTCHours();
  const min = date.getUTCMinutes();

  const technique = dose.technique;

  const shake = techniqueBand(technique.shakeDuration, TECHNIQUE_THRESHOLDS.shakeDuration);

  const inspiratory = techniqueBand(
    technique.inspiratoryTime,
    TECHNIQUE_THRESHOLDS.inspiratoryTime,
  );

  const flow = techniqueBand(
    technique.peakInspiratoryFlowRate,
    TECHNIQUE_THRESHOLDS.peakInspiratoryFlowRate,
  );

  const orientation = techniqueBand(
    technique.deviceOrientation,
    TECHNIQUE_THRESHOLDS.deviceOrientation,
    true,
  );

  const volume = techniqueBand(
    technique.estimatedDeliveredVolume,
    TECHNIQUE_THRESHOLDS.estimatedDeliveredVolume,
  );

  return [
    `Time: ${hour}:${min.toString().padStart(2, '0')}`,
    `Technique Score: ${technique.techniqueScore}`,
    '',
    `Shake Duration: ${technique.shakeDuration} ms (${shake})`,
    `Inspiratory Time: ${technique.inspiratoryTime} ms (${inspiratory})`,
    `Peak Flow Rate: ${technique.peakInspiratoryFlowRate} L/min (${flow})`,
    `Device Orientation: ${technique.deviceOrientation}° (${orientation})`,
    `Delivered Volume: ${technique.estimatedDeliveredVolume} mL (${volume})`,
  ];
}

function techniqueBand(
  value: number,
  threshold: TechniqueThreshold,
  lowerIsBetter = false,
): 'good' | 'acceptable' | 'poor' {
  if (lowerIsBetter) {
    if (value <= threshold.good.value) {
      return 'good';
    }
    if (value <= threshold.acceptable.value) {
      return 'acceptable';
    }
    return 'poor';
  } else {
    if (value >= threshold.good.value) {
      return 'good';
    }
    if (value >= threshold.acceptable.value) {
      return 'acceptable';
    }
    return 'poor';
  }
}

