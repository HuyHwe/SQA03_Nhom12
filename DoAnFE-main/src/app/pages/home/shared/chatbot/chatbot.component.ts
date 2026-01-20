import { Component } from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { NoInterceptorHttpService } from 'src/app/layout/loadingInteceptor/no-interceptor-http.service';
@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  isOpen = false;
  messages: { from: 'user' | 'bot'; text: string }[] = [];
  inputMessage = '';
  isLoading = false;

  constructor(
    private noInterceptorHttp: NoInterceptorHttpService,
    private localStorageService: LocalStorageService
  ) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    const msg = this.inputMessage.trim();
    this.inputMessage = ''; // Clear input field immediately to avoid double submission
    if (!msg || this.isLoading) return;

    this.messages.push({
      from: 'user',
      text: msg
    });

    this.isLoading = true;

    const token = this.localStorageService.getItem(ConstantsApp.accessToken);
    if (!token) {
      this.messages.push({ from: 'bot', text: 'Vui lòng đăng nhập để sử dụng chatbot.' });
      this.inputMessage = '';
      this.isLoading = false;
      return;
    }

    const lowerMsg = msg.toLowerCase();
    let apiUrl = '';
    let body: any = null;

    if (lowerMsg.includes('tìm việc') || lowerMsg.includes('tuyển dụng')) {
      apiUrl = 'http://localhost:2000/bs-user/bs-job/_search';
      body = this.createJobParamDTO(msg, 'job');
    } else if (lowerMsg.includes('freelancer') || lowerMsg.includes('người làm tự do')) {
      apiUrl = 'http://localhost:2000/bs-user/freelancer/_search';
      body = this.createJobParamDTO(msg, 'freelancer');
    } else {
      this.callChatApi(msg, token);
      return;
    }

    this.noInterceptorHttp.getHttpClient().post<any>(apiUrl, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        const responseText = this.formatResponse(res, apiUrl.includes('freelancer') ? 'freelancer' : 'job');
        this.messages.push({ from: 'bot', text: responseText });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.messages.push({ from: 'bot', text: 'Xin lỗi, có lỗi khi xử lý yêu cầu: ' + err.message });
        this.isLoading = false;
      }
    });

    this.inputMessage = '';
  }

  private createJobParamDTO(message: string, type: 'job' | 'freelancer'): any {
    const lowerMsg = message.toLowerCase();
    const jobParamDTO: any = {
      keySearch: '',
      sort: [{ field: 'creationDate', direction: 'desc' }], // Sắp xếp theo creationDate giảm dần
      filters: [{ field: 'expDate', operator: 'gte', value: new Date().toISOString() }] // Lọc expDate còn hiệu lực
    };

    const province = this.extractProvince(message);
    if (province) {
      jobParamDTO.keySearch = province;
      return jobParamDTO;
    }

    const skill = this.extractSkill(message);
    if (skill) {
      jobParamDTO.keySearch = skill;
      return jobParamDTO;
    }

    const jobTitle = this.extractJobTitle(message);
    if (jobTitle) {
      jobParamDTO.keySearch = jobTitle;
      return jobParamDTO;
    }

    return jobParamDTO;
  }

  private callChatApi(message: string, token: string) {
    this.noInterceptorHttp.getHttpClient().post<{ response: string }>(
      'http://localhost:2000/bs-user/api/chat',
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).subscribe({
      next: (res) => {
        this.messages.push({ from: 'bot', text: res.response });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Chat API Error:', err);
        this.messages.push({ from: 'bot', text: 'Xin lỗi, có lỗi khi xử lý yêu cầu: ' + err.message });
        this.isLoading = false;
      }
    });
  }

  private extractProvince(message: string): string | null {
    const provinces = ['hà nội', 'tp hcm', 'đà nẵng', 'cần thơ', 'hải phòng'];
    const lowerMsg = message.toLowerCase();
    return provinces.find(prov => lowerMsg.includes(prov)) || null;
  }

  private extractSkill(message: string): string | null {
    const skills = ['java', 'python', 'javascript', 'react', 'angular'];
    const lowerMsg = message.toLowerCase();
    return skills.find(skill => lowerMsg.includes(skill)) || null;
  }

  private extractJobTitle(message: string): string | null {
    const lowerMsg = message.toLowerCase();
    const jobMatch = lowerMsg.match(/(?:tìm việc|tuyển dụng|freelancer|người làm tự do)\s+([^\s].*?)(?:\s+tại|\s+ở|\s+kỹ năng|$)/i);
    return jobMatch ? jobMatch[1] : null;
  }

  private formatResponse(response: any, type: 'job' | 'freelancer'): string {
    const data = response.data;
    if (!data || data.length === 0) {
      return `Không tìm thấy ${type === 'job' ? 'tin tuyển dụng' : 'freelancer'} phù hợp.`;
    }

    let result = type === 'job' ? 'Danh sách tin tuyển dụng:\n' : 'Danh sách freelancer:\n';
    data.forEach((item: any, index: number) => {
      if (type === 'job') {
        result += `${index + 1}. ${item.name || 'Không xác định'} tại ${item.province || 'Không xác định'} (Mức lương: ${item.salary || 'Thỏa thuận'})\n`;
        if (item.des) {
          result += `   Mô tả: ${item.des.substring(0, 100)}...\n`;
        }
      } else {
        result += `${index + 1}. ${item.name || 'Không xác định'} (${item.job || 'Không xác định'}) tại ${item.province || 'Không xác định'}\n`;
        if (item.skillDes) {
          result += `   Kỹ năng: ${item.skillDes}\n`;
        }
        if (item.ratingAvg) {
          result += `   Đánh giá: ${item.ratingAvg}/5\n`;
        }
      }
    });
    return result;
  }
}