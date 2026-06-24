import { Component, signal, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardData } from '../../../core/interfaces/settings';
import Chart from 'chart.js/auto';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chartInstance: Chart | null = null;

  currentLang: string = 'en';
  data = signal<DashboardData | null>(null);
  loading = signal(true);
  error = signal(false);

  constructor(private _adminService: AdminService, private _translate : TranslateService, private langService :LanguageService) {}

  ngOnInit(): void {
    this.currentLang = this.langService.getCurrentLang();
    this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    if (this.data()) {
      this.updateChart(this.data()!.salesOverTime);
    }
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);

    this._adminService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res.data);
        setTimeout(() => {
          this.updateChart(res.data.salesOverTime);
        }, 100);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  updateChart(salesData: { date: string; count: number; revenue: number }[]): void {
    if (!this.chartCanvas) {
      console.warn('Chart canvas not ready yet');
      return;
    }

    const ctx = this.chartCanvas.nativeElement?.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (!salesData || salesData.length === 0) {
      console.warn('No sales data available');
      return;
    }

    const labels = salesData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    });

    const counts = salesData.map((item) => item.count);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'الطلبات',
            data: counts,
            borderColor: '#1f2937',
            backgroundColor: 'rgba(31, 41, 55, 0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#1f2937',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#4b5563',
              font: { size: 12, weight: 'normal' },
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#fff',
            bodyColor: '#e5e7eb',
            cornerRadius: 8,
            padding: 12,
          },
        },
        scales: {
          x: {
            ticks: { color: '#9ca3af', font: { size: 11 } },
            grid: { display: false },
          },
          y: {
            ticks: { color: '#9ca3af', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.04)' },
            beginAtZero: true,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });
  }

  getStatusClass(status: string): string {
    const classes: any = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      shipped: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return classes[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: this._translate.instant('admin.orders.filter_pending'),
      completed: this._translate.instant('admin.orders.filter_completed'),
      cancelled: this._translate.instant('admin.orders.filter_cancelled')
    };
    return labels[status] || status;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
}
