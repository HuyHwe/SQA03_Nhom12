import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { CommonService } from 'src/app/service/common.service';
import { NotificationService } from 'src/app/pages/notification/notification.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';

@Component({
  selector: 'app-job-notification-chart',
  templateUrl: './job-notification-chart.component.html',
  styleUrls: ['./job-notification-chart.component.scss']
})
export class JobNotificationChartComponent implements OnInit {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  private chart!: Chart;

  public jobPosts: any[] = [];
  public selectedJob: any;
  public barChartLabels = ['Xem', 'Lưu', 'Ứng tuyển'];

  constructor(
    private commonService: CommonService,
    private notificationService: NotificationService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.loadJobPosts();
  }

  ngAfterViewInit(): void {
    // Chart sẽ được khởi tạo sau khi load dữ liệu lần đầu
  }

  loadJobPosts() {
    const recruiter = JSON.parse(this.utilsService.getItem('user'));

    // console.log("Recruiter: ", recruiter)
    // if ( recruiter.id === undefined) {
    //   console.warn('Không phải recruiter');
    //   return;
    // }

    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_RECRUITER_GET_POSTS;
    const body = { page: 1, size: 100 };

    this.commonService.postDatas(body, apiUrl, 'loadJobPosts', 'Lấy danh sách bài đăng của recruiter')
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            console.log('Bài đăng của recruiter:', res.data);
            this.jobPosts = res.data.map((job: any) => ({
              id: job.id,
              name: job.jname || 'Bài đăng không tên'
            }));
            if (this.jobPosts.length > 0) {
              this.selectedJob = this.jobPosts[0];
              this.loadNotificationStats(this.selectedJob.id);
            }
          }
        },
        error: (err) => {
          console.error('Lỗi tải bài đăng:', err);
        }
      });
  }

  onJobSelected() {
    if (this.selectedJob) {
      this.loadNotificationStats(this.selectedJob.id);
    }
  }

  loadNotificationStats(postId: number) {
    const apiUrl = `${environment.API_URI}${ApiNameConstants.BS_NOTIFICATION_STATS}/${postId}`;

    this.commonService.getData(apiUrl, 'loadNotificationStats', 'Lấy thống kê thông báo theo postId')
      .subscribe({
        next: (res: any) => {
          const stats = res || {};
          const data = [
            stats['JOB_VIEW'] || 0,
            stats['JOB_SAVE'] || 0,
            stats['JOB_APPLY'] || 0
          ];
          this.renderChart(data, `Thống kê cho bài đăng: ${this.selectedJob.name}`);
        },
        error: (err) => {
          console.error('Lỗi tải thống kê:', err);
          this.renderChart([0, 0, 0], `Thống kê cho bài đăng: ${this.selectedJob.name}`);
        }
      });
  }

  renderChart(data: number[], label: string) {
    if (this.chart) {
      this.chart.destroy(); // Xóa chart cũ để tránh trùng
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.barChartLabels,
        datasets: [{
          label,
          data,
          backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
          borderColor: ['#388E3C', '#FFA000', '#1976D2'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.chart = new Chart(this.barChartRef.nativeElement, config);
  }
}
