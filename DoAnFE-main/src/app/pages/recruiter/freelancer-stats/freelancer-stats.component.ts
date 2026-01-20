import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FreelancerStatsResponse } from 'src/app/model/freelancer-stats-response.model';
import { FreelancerStatsService } from './freelancer-stats.service';
import { FreelancerStatsRequest } from 'src/app/model/freelancer-stats-request.model';
import { ExportService } from 'src/app/service/export.service';
import { PopupInfoCandidateComponent } from '../candidate-management/table-candidate/popupInfoCandidate/popup-info-candidate.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';

interface JobItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-freelancer-stats',
  templateUrl: './freelancer-stats.component.html',
  styleUrls: ['./freelancer-stats.component.scss']
})
export class FreelancerStatsComponent implements OnInit {
  statsForm: FormGroup;
  isLoading = false;
  responseData: FreelancerStatsResponse[] = [];
  errorMessage: string | null = null;
  checkedItems: FreelancerStatsResponse[] = [];
  jobs: JobItem[] = [];
  selectedJobId: number | null = null;

  @ViewChild('popupInfoCandidate') popupInfoCandidate!: PopupInfoCandidateComponent;
  selectedFreelancer: FreelancerStatsResponse;

  constructor(
    private fb: FormBuilder,
    private statsService: FreelancerStatsService,
    private exportService: ExportService,
    private localStorageService: LocalStorageService,
  ) {
    this.statsForm = this.fb.group({
      jobId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  /** Load job list từ API backend */
  loadJobs(): void {
    this.statsService.listJobs({ page: 1, size: 50 }).subscribe({
      next: (res: any) => {
        // res.data là mảng jobs
        const uniqueJobsMap = new Map<number, string>();

        res.data.forEach((job: any) => {
          // Dùng jdId làm id, jobDefaultName làm name
          if (!uniqueJobsMap.has(job.id)) {
            uniqueJobsMap.set(job.id, job.jobDefaultName);
          }
        });

        // Chuyển map sang array để binding dropdown
        this.jobs = Array.from(uniqueJobsMap.entries()).map(([id, name]) => ({ id, name }));

        // Chọn mặc định job đầu tiên
        if (this.jobs.length > 0) {
          this.selectedJobId = this.jobs[0].id;
          this.statsForm.get('jobId')?.setValue(this.selectedJobId);
        }
      },
      error: (err) => {
        console.error('Error loading jobs', err);
        this.errorMessage = 'Failed to load jobs';
      }
    });
  }


  /** Submit form */
  onSubmit(): void {
    if (!this.statsForm.valid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.checkedItems = [];

    const request: FreelancerStatsRequest = {
      jobId: this.statsForm.get('jobId')?.value || this.selectedJobId || 0,
      recruiterId: this.localStorageService.getItem("user").id || 0,
      topK: 10
    };

    this.statsService.getFreelancerStatsByJobDefault(request).subscribe({
      next: (response: FreelancerStatsResponse[]) => {
        this.responseData = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error fetching stats: ' + (err.message || 'Unknown error');
        this.isLoading = false;
        console.error('API Error:', err);
      }
    });
  }

  /** Tính trung bình score */
  get averageScorePercentage(): number {
    if (!this.responseData || this.responseData.length === 0) return 0;
    const sum = this.responseData.reduce((acc, f) => acc + (f.score ?? 0), 0);
    return Math.round((sum / this.responseData.length) * 100);
  }

  /** Checkbox logic */
  onCheckboxChange(freelancer: FreelancerStatsResponse, event: any): void {
    if (event.target.checked) {
      this.checkedItems.push(freelancer);
    } else {
      this.checkedItems = this.checkedItems.filter(f => f.id !== freelancer.id);
    }
  }

  isChecked(freelancer: FreelancerStatsResponse): boolean {
    return this.checkedItems.some(f => f.id === freelancer.id);
  }

  onSelectAll(event: any): void {
    if (event.target.checked) {
      this.checkedItems = [...this.responseData];
    } else {
      this.checkedItems = [];
    }
  }

  /** Export Excel */
  exportFile(): void {
    if (this.checkedItems.length > 0) {
      this.exportService.exportExcel(this.checkedItems, 'Freelancer-Stats-file');
    }
  }

  /** Popup info */
  openPopupInfoCandidate(freelancer: FreelancerStatsResponse) {
    this.selectedFreelancer = freelancer;
    console.log('Selected freelancer for popup:', freelancer, "   ", freelancer.id);
    this.popupInfoCandidate.openPopup(freelancer);
    
  }

  onOpenInterviewPopup(status: number = 1): void {
    this.popupInfoCandidate.onInterview(status);
  }

  onInterview(status: number): void {
    console.log('Interview status changed to:', status);
    this.onOpenInterviewPopup(status);
  }
}
