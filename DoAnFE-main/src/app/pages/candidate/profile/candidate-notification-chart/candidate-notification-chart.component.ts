import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-candidate-notification-chart',
    templateUrl: './candidate-notification-chart.component.html',
    styleUrls: ['./candidate-notification-chart.component.scss']
})
export class CandidateNotificationChartComponent implements OnInit {
    @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
    private chart!: Chart;

    public barChartLabels = ['Xem CV', 'Đặt lịch phỏng vấn'];
    public stats: {
        counts: { PROFILE_VIEW: number; INTERVIEW: number };
        recruiters: { PROFILE_VIEW: string[]; INTERVIEW: string[] };
    } = {
            counts: { PROFILE_VIEW: 0, INTERVIEW: 0 },
            recruiters: { PROFILE_VIEW: [], INTERVIEW: [] }
        };

    constructor(
        private commonService: CommonService,
        private notificationService: NotificationService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        this.loadNotificationStats();
    }

    loadNotificationStats() {
        const candidate = JSON.parse(this.utilsService.getItem('user'));

        console.log("Candidate: ", candidate)
        // if (!candidate || !candidate.id) {
        //     console.warn('Không tìm thấy thông tin ứng viên');
        //     this.renderChart([0, 0], 'Thống kê hoạt động trên hồ sơ của bạn');
        //     return;
        // }

        const apiUrl = `${environment.API_URI}${ApiNameConstants.BS_NOTIFICATION_STATS_CANDIDATE}/${candidate.id}`;

        this.commonService.getData(apiUrl, 'loadNotificationStats', 'Lấy thống kê thông báo cho ứng viên')
            .subscribe({
                next: (res: any) => {
                    this.stats = res || { counts: { PROFILE_VIEW: 0, INTERVIEW: 0 }, recruiters: { PROFILE_VIEW: [], INTERVIEW: [] } };
                    const data = [
                        this.stats.counts['PROFILE_VIEW'] || 0,
                        this.stats.counts['INTERVIEW'] || 0
                    ];
                    this.renderChart(data, 'Thống kê hoạt động trên hồ sơ của bạn');
                },
                error: (err) => {
                    console.error('Lỗi tải thống kê:', err);
                    this.renderChart([0, 0], 'Thống kê hoạt động trên hồ sơ của bạn');
                }
            });
    }

    renderChart(data: number[], label: string) {
        if (this.chart) {
            this.chart.destroy();
        }

        // Gom danh sách nhà tuyển dụng và số liệu
        const recruiterNames = Array.from(
            new Set([
                ...this.stats.recruiters.PROFILE_VIEW,
                ...this.stats.recruiters.INTERVIEW
            ])
        );

        // Tạo màu ngẫu nhiên cho từng recruiter
        const colors = recruiterNames.map(() =>
            `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
        );

        // Tạo datasets, mỗi recruiter là 1 dataset
        const datasets = recruiterNames.map((recruiter, idx) => {
            return {
                label: recruiter,
                data: [
                    this.stats.recruiters.PROFILE_VIEW.filter(r => r === recruiter).length,
                    this.stats.recruiters.INTERVIEW.filter(r => r === recruiter).length
                ],
                backgroundColor: colors[idx],
                stack: 'stack1'
            };
        });

        const config: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: this.barChartLabels,
                datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const recruiter = context.dataset.label || '';
                                const count = context.raw as number;
                                return `${recruiter}: ${count}`;
                            }
                        }
                    }
                }
            }
        };

        this.chart = new Chart(this.barChartRef.nativeElement, config);
    }


}
