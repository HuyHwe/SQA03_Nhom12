import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-compound-interest',
  templateUrl: './compound-interest.component.html',
  styleUrls: ['./compound-interest.component.scss'],
})
export class CompoundInterestComponent implements OnInit {
  step1: number ; // Default
  step2: number ; // Default
  interestRate: number ; // Default
  years: number  ; // Default
  period: string = ''; // Default
  result: number = 0;
  yearsData: number[] = [];
  interestData: number[] = [];
  labels: (string | number)[] = [];
  totalData: number[] = []; // Thêm cho giá trị tương lai
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private chart: any;
errors = {
  step1: false,
  step2: false,
  years: false,
  interestRate: false,
  period: false,
};

onSubmit() {
  this.errors = {
    step1: !this.step1,
    step2: !this.step2,
    years: !this.years,
    interestRate: !this.interestRate,
    period: !this.period,
  };

  const hasError = Object.values(this.errors).some(v => v);
  if (hasError) return;

  this.calculateCompoundInterest();
}

  ngOnInit() {
    // Có thể gọi calculateCompoundInterest() nếu muốn hiển thị default
  }
calculateCompoundInterest() {
  let total = this.step1;
  let accumulatedContributions = 0;
  const i = this.interestRate / 100;

  this.labels = [];
  this.interestData = [];
  this.totalData = [];

  if (this.period === 'year') {
    // ====== GHÉP LÃI HÀNG NĂM ======
    this.labels.push(0);
    this.interestData.push(0);
    this.totalData.push(total);

    for (let year = 1; year <= this.years; year++) {
      for (let m = 0; m < 12; m++) {
        total += this.step2;
        accumulatedContributions += this.step2;
      }

      total *= (1 + i);

      this.labels.push(year);
      const principal = this.step1 + accumulatedContributions;
      this.interestData.push(total - principal);
      this.totalData.push(total);
    }
  }

  if (this.period === 'month') {
    // ====== GHÉP LÃI HÀNG THÁNG ======
    const totalMonths = this.years * 12;
    this.labels.push(0);
    this.interestData.push(0);
    this.totalData.push(total);

    for (let month = 1; month <= totalMonths; month++) {
      total += this.step2;
      accumulatedContributions += this.step2;

      total *= (1 + i / 12);

      this.labels.push(month);
      const principal = this.step1 + accumulatedContributions;
      this.interestData.push(total - principal);
      this.totalData.push(total);
    }
  }

  this.result = Math.round(total);
  setTimeout(() => this.updateChart(), 0);
}



 updateChart() {
  if (this.chart) {
    this.chart.destroy();
  }

  const ctx = this.chartCanvas.nativeElement.getContext('2d');
  this.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: this.labels,
      datasets: [
        {
          label: 'Lãi kép (VNĐ)',
          data: this.interestData,
          borderColor: '#00b14f',
          fill: false,
        },
        {
          label: 'Giá trị tương lai (VNĐ)',
          data: this.totalData,
          borderColor: 'rgb(255, 0, 0)',
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: this.period === 'month' ? 'Tháng' : 'Năm',
          },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Số tiền (VNĐ)' },
        },
      },
    },
  });
}

}