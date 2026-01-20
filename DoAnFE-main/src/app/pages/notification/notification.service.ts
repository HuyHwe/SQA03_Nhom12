import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, Message } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Notification } from './notification.model';
import { LocalStorageService } from 'src/app/core/auth/local-storage.service';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:2000/bs-user/notifications';
  private wsUrl = 'http://localhost:2005/ws'; // WebSocket URL
  private stompClient: Client | null = null;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.localStorageService.getItem(ConstantsApp.accessToken);
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getNotifications(userId: number, role: string): Observable<Notification[]> {
    console.log(`Fetching notifications for userId: ${userId}, role: ${role}`);
    const headers = this.getHeaders();
    return this.http.get<Notification[]>(`${this.apiUrl}/${userId}/${role}`, { headers });
  }
  createNotification(receiverId: number, role: string, title: string, message: string, type: string, actionUrl?: string, senderId?: number): Observable<void> {
    console.log(`Creating notification for userId: ${receiverId}, role: ${role}`);
    const headers = this.getHeaders();
    let params = new HttpParams()
      .set('userId', receiverId)
      .set('role', role)
      .set('title', title)
      .set('message', message)                                  
      .set('type', type)
    if (actionUrl) {
      params = params.set('actionUrl', actionUrl);
    }
    if(senderId) {
      params = params.set('senderId', senderId);
    }
    return this.http.post<void>(`${this.apiUrl}/send`, null, { headers, params });
  }

  markAsRead(notificationId: number): Observable<void> {
    console.log(`Marking notification ${notificationId} as read`);
    const headers = this.getHeaders();
    return this.http.post<void>(`${this.apiUrl}/mark-read/${notificationId}`, {}, { headers });
  }

  connectWebSocket(userId: number, callback: (notification: Notification) => void) {
    if (!userId) {
      console.error('Cannot connect WebSocket: userId is null');
      return;
    }

    const token = this.localStorageService.getItem(ConstantsApp.accessToken);
    if (!token) {
      console.error('Cannot connect WebSocket: token is null');
      return;
    }

    try {
      this.stompClient = new Client({
        webSocketFactory: () => {
          console.log(`Attempting to connect to WebSocket at ${this.wsUrl}?access_token=${token}`);
          return new SockJS(`${this.wsUrl}?access_token=${token}`);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => console.log('STOMP Debug:', str)
      });

      this.stompClient.onConnect = (frame) => {
        console.log('WebSocket connected successfully:', frame);
        this.stompClient?.subscribe(`/user/${userId}/queue/notifications`, (message: Message) => {
          console.log('Received WebSocket message:', message.body);
          try {
            const notification = JSON.parse(message.body);
            callback(notification);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('WebSocket STOMP error:', frame);
      };

      this.stompClient.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
      };

      this.stompClient.onWebSocketClose = (event) => {
        console.error('WebSocket closed:', event);
      };

      this.stompClient.activate();
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  disconnectWebSocket() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('WebSocket disconnected');
      this.stompClient = null;
    }
  }
}