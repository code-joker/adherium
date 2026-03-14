import { Routes } from '@angular/router';
import { Layout } from './core/layout/layout';
import { DashboardPage } from './features/dashboard/dashboard-page/dashboard-page';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        component: DashboardPage,
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
