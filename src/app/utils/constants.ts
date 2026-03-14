import { TooltipOptions } from 'chart.js';

export const baseTooltipOptions: TooltipOptions<any> = {
  backgroundColor: '#111827',
  titleColor: '#ffffff',
  bodyColor: '#e5e7eb',

  bodyFont: {
    size: 14,
  },

  titleFont: {
    size: 15,
    weight: 'bold',
  },

  padding: 14,
  cornerRadius: 10,
  displayColors: false,
} as any;

export const goodColor = '#22c55e';
export const acceptableColor = '#f97316';
export const poorColor = '#ef4444';
