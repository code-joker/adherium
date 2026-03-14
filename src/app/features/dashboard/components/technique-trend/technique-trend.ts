import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DoseEvent, MedicationDetail, MedicationType } from '../../../../models';
import { baseTooltipOptions, doseTooltip, formatDate } from '../../../../utils';

interface TechniquePoint {
  x: number;
  y: number;
  doseEvent: DoseEvent | null;
}

@Component({
  selector: 'app-technique-trend',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './technique-trend.html',
})
export class TechniqueTrendComponent implements OnChanges {
  @Input()
  medications: MedicationDetail[] = [];

  private _labels: string[] = [];

  chartType: 'line' = 'line';

  chartData: ChartData<'line'> = {
    datasets: [],
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      x: {
        type: 'linear',
        min: 0,
        ticks: {
          stepSize: 1,
          callback: (value) => this._labels[value as number] ?? '',
        },
        title: {
          display: true,
          text: 'Day',
        },
      },

      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Technique Score',
        },
      },
    },

    plugins: {
      legend: {
        position: 'top',
      },

      tooltip: {
        ...baseTooltipOptions,

        callbacks: {
          title: (_) => {
            return 'Dose Event';
          },

          label: (ctx) => {
            const point = ctx.raw as TechniquePoint;

            if (!point.doseEvent) {
              return '';
            }

            return doseTooltip(point.doseEvent);
          },
        },
      },

      annotation: {
        annotations: {
          poorZone: {
            type: 'box',
            yMin: 0,
            yMax: 60,
            backgroundColor: 'rgba(239,68,68,0.12)',
            borderWidth: 0,
          },

          acceptableZone: {
            type: 'box',
            yMin: 60,
            yMax: 80,
            backgroundColor: 'rgba(250,204,21,0.12)',
            borderWidth: 0,
          },

          goodZone: {
            type: 'box',
            yMin: 80,
            yMax: 100,
            backgroundColor: 'rgba(34,197,94,0.12)',
            borderWidth: 0,
          },
        },
      },
    },
  };

  ngOnChanges(): void {
    if (!this.medications?.length) {
      return;
    }

    this._buildChart();
  }

  private _buildChart(): void {
    const controller = this.medications.filter(
      (m) => m.medicationType === MedicationType.Controller,
    );
    const rescue = this.medications.filter((m) => m.medicationType === MedicationType.Rescue);

    const dayIndex = this._buildDayIndex(controller, rescue);
    this._labels = Array.from(dayIndex.keys());

    const morning = this._aggregate(controller, 'morning', dayIndex);
    const evening = this._aggregate(controller, 'evening', dayIndex);
    const rescueLine = this._aggregate(rescue, 'rescue', dayIndex);

    this.chartData = {
      datasets: [
        {
          label: 'Morning Controller',
          data: morning,
          borderColor: '#60a5fa',
          backgroundColor: '#60a5fa',
          tension: 0.1,
        },
        {
          label: 'Evening Controller',
          data: evening,
          borderColor: '#1e3a8a',
          backgroundColor: '#1e3a8a',
          tension: 0.1,
        },
        {
          label: 'Rescue Inhaler',
          data: rescueLine,
          borderColor: '#ef4444',
          backgroundColor: '#ef4444',
          tension: 0.1,
        },
      ],
    };
  }

  private _aggregate(
    medications: MedicationDetail[],
    type: 'morning' | 'evening' | 'rescue',
    dayIndex: Map<string, number>,
  ): TechniquePoint[] {
    const points: TechniquePoint[] = [];

    medications.forEach((m) => {
      m.doses.forEach((d) => {
        if (type !== 'rescue') {
          if (!d.scheduledTime) {
            return;
          }

          const hour = Number(d.scheduledTime.split(':')[0]);
          const isMorning = hour < 12;

          if (type === 'morning' && !isMorning) {
            return;
          }
          if (type === 'evening' && isMorning) {
            return;
          }
        }

        const day = formatDate(d.timestamp);

        points.push({
          x: dayIndex.get(day)!,
          y: d.technique.techniqueScore,
          doseEvent: d,
        });
      });
    });

    return points.sort((a, b) => a.x - b.x);
  }

  private _buildDayIndex(
    controller: MedicationDetail[],
    rescue: MedicationDetail[],
  ): Map<string, number> {
    const days = new Set<string>();

    [...controller, ...rescue].forEach((m) => {
      m.doses.forEach((d) => {
        days.add(formatDate(d.timestamp));
      });

      m.missedDoses.forEach((d) => {
        days.add(formatDate(d.timestamp));
      });
    });

    const sorted = Array.from(days).sort();

    return new Map(sorted.map((day, i) => [day, i]));
  }
}
