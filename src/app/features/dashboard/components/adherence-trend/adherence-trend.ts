import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ScatterDataPoint } from 'chart.js';

import { DoseEvent, MedicationDetail } from '../../../../models';
import {
  baseTooltipOptions,
  doseTooltip,
  poorColor,
  acceptableColor,
  goodColor,
  formatDate,
} from '../../../../utils';

interface DosePoint extends ScatterDataPoint {
  doseEvent: DoseEvent | null;
}

@Component({
  selector: 'app-adherence-trends',
  imports: [BaseChartDirective],
  templateUrl: './adherence-trend.html',
})
export class AdherenceTrendComponent implements OnChanges {
  @Input({ required: true })
  medication!: MedicationDetail;

  chartType: 'scatter' = 'scatter';
  chartData: ChartData<'scatter'> = {
    datasets: [],
  };
  chartOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {},
    plugins: {},
  };

  private _labels: string[] = [];

  ngOnChanges(): void {
    this._buildChart();
  }

  private _buildChart(): void {
    const dayIndex = this._buildDayIndex();

    this._labels = Array.from(dayIndex.keys());

    const labels = this._labels;

    const taken: DosePoint[] = this.medication.doses
      .map((d) => ({
        x: dayIndex.get(formatDate(d.timestamp))!,
        y: this._hourDecimal(d.timestamp),
        doseEvent: d,
      }))
      .sort((a, b) => (a.x as number) - (b.x as number));

    const missed: DosePoint[] = this.medication.missedDoses
      .map((d) => ({
        x: dayIndex.get(formatDate(d.timestamp))!,
        y: this._scheduledHour(d.scheduledTime),
        doseEvent: null,
      }))
      .sort((a, b) => (a.x as number) - (b.x as number));

    this.chartData = {
      datasets: [
        {
          label: 'Dose Taken',
          data: taken,
          pointRadius: 6,
          pointStyle: 'circle',
          backgroundColor: (ctx) => {
            const point = ctx.raw as DosePoint;

            if (!point.doseEvent) {
              return '#2563eb';
            }

            return this._scoreColor(point.doseEvent.technique.techniqueScore);
          },
        },
        {
          label: 'Missed Dose',
          data: missed,
          pointStyle: 'crossRot',
          borderColor: '#ef4444',
          borderWidth: 2,
          pointRadius: 8,
          backgroundColor: 'transparent',
        },
        //
        {
          label: 'Scheduled Window',
          data: [],
          pointStyle: 'rect',
          backgroundColor: 'rgba(59,130,246,0.25)',
          borderWidth: 0,
        },

        {
          label: 'Scheduled Time',
          data: [],
          showLine: true,
          borderColor: '#3b82f6',
          borderDash: [6, 6],
          pointStyle: 'line',
          pointRadius: 0,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: labels.length - 1,
          offset: true,
          ticks: {
            stepSize: 1,
            autoSkip: false,
            callback(value) {
              return labels[value as number] ?? '';
            },
          },
          title: {
            display: true,
            text: 'Day',
          },
        },

        y: {
          min: 0,
          max: 24,
          ticks: {
            stepSize: 2,
          },
          title: {
            display: true,
            text: 'Hour of Day',
          },
        },
      },

      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            generateLabels: (chart) => {
              const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

              const dose = labels.find((l) => l.text === 'Dose Taken');
              if (dose) {
                dose.fillStyle = 'transparent';
                dose.strokeStyle = '#374151';
              }

              return labels;
            },
          },
        },
        annotation: {
          annotations: this._scheduleAnnotations(),
        },
        tooltip: {
          ...baseTooltipOptions,

          callbacks: {
            title: (ctx) => {
              const point = ctx[0].raw as DosePoint;

              if (point.doseEvent === null) {
                return 'Missed Dose';
              }

              return 'Dose Taken';
            },
            label: (ctx) => {
              const point = ctx.raw as DosePoint;

              if (point.doseEvent === null) {
                return '';
              }

              return doseTooltip(point.doseEvent);
            },
          },
        },
      },
    };
  }

  private _buildDayIndex(): Map<string, number> {
    const days = new Set<string>();

    [...this.medication.doses, ...this.medication.missedDoses].forEach((d) =>
      days.add(formatDate(d.timestamp)),
    );

    const sorted = Array.from(days).sort();

    return new Map(sorted.map((day, i) => [day, i]));
  }

  private _scheduleAnnotations(): any {
    const annotations: any = {};

    this.medication.schedule.forEach((s, i) => {
      const [h, m] = s.scheduledTime.split(':').map(Number);
      const center = h + m / 60;

      const before = s.windowBefore / 60;
      const after = s.windowAfter / 60;

      const yMin = center - before;
      const yMax = center + after;

      annotations[`window${i}`] = {
        type: 'box',
        yMin,
        yMax,
        backgroundColor: 'rgba(59,130,246,0.12)',
        borderWidth: 0,
      };

      annotations[`schedule${i}`] = {
        type: 'line',
        yMin: center,
        yMax: center,
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderDash: [6, 6],
      };
    });

    return annotations;
  }

  private _hourDecimal(date: Date): number {
    return date.getUTCHours() + date.getUTCMinutes() / 60;
  }

  private _scheduledHour(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
  }

  private _scoreColor(score: number): string {
    if (score < 60) {
      return poorColor;
    }

    if (score < 80) {
      return acceptableColor;
    }

    return goodColor;
  }
}
