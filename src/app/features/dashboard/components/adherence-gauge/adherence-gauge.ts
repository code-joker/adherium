import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MedicationDetail } from '../../../../models';

@Component({
  selector: 'app-adherence-gauge',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './adherence-gauge.html',
})
export class AdherenceGaugeComponent implements OnChanges {
  @Input({ required: true })
  medication!: MedicationDetail;

  taken = 0;
  expected = 0;
  missed = 0;

  selectedMedicationId: string | null = null;

  ngOnInit(): void {
    this._buildChart();
  }

  ngOnChanges(): void {
    this._buildChart();
  }

  percentage = 0;

  chartType: 'doughnut' = 'doughnut';

  chartData: ChartData<'doughnut'> = {
    datasets: [],
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    cutout: '70%',

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => {
            const total = this.taken + this.missed;
            const value = ctx.raw as number;

            const percent = Math.round((value / total) * 100);

            if (ctx.dataIndex == 1) {
              return `${ctx.label}: ${total}`;
            }

            return `${ctx.label}: ${value} (${percent}%)`;
          },
        },
      },
    },

    rotation: -90,
    circumference: 180,
  };

  private _buildChart(): void {
    const taken = this.medication.doses.length;
    const missed = this.medication.missedDoses.length;

    this.chartData = {
      labels: ['Taken', 'Expected'],
      datasets: [
        {
          data: [taken, missed],
          backgroundColor: ['#16a34a', '#bbf7d0'],
          borderWidth: 0,
          weight: 1,
        },
      ],
    };

    this.percentage = this.medication.adherence;
    this.expected = this.medication.expectedDoses;
    this.taken = taken;
    this.missed = missed;
  }
}
