import * as Stomp from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import {NotificationComponent} from "../pages/notification/notification.component";
import {Client, Message} from "@stomp/stompjs";
import {Observable, Subject} from "rxjs";
export class WebSocketAPI {
    webSocketEndPoint: string = 'http://localhost:8080/ws';
    topic: string = "/topic/greetings";
    private stompClient: Client;
    private socket: WebSocket;

  private messageSubject: Subject<Message>;
    appComponent: NotificationComponent;
    constructor(appComponent: NotificationComponent){
        this.appComponent = appComponent;
        this.stompClient = new Client();
        this.messageSubject = new Subject<Message>();
    }
    /*_connect() {
        console.log("Initialize WebSocket Connection");
        let ws = new SockJS(this.webSocketEndPoint);
        this.stompClient = Stomp.client(ws);
        const _this = this;
        _this.stompClient.connect({}, function (frame: any) {
            _this.stompClient.subscribe(_this.topic, function (sdkEvent : any) {
                _this.onMessageReceived(sdkEvent);
            });
            //_this.stompClient.reconnect_delay = 2000;
        }, this.errorCallBack);
    };*/
  _connect(): void {
    this.socket = new WebSocket('ws://localhost:8080/gs-guide-websocket/topic/notifications');

    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket connection opened:', event);
    });

    this.socket.addEventListener('message', (event) => {
      console.log('WebSocket message received:', event);
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed:', event);
    });

    this.socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
  }
    __connect() : Observable<Message> {
      return new Observable<Message>((observer) => {
        this.stompClient.configure({
          brokerURL: 'ws://localhost:8080/gs-guide-websocket', // Replace with your actual broker URL
          onConnect: () => {
            this.stompClient.subscribe('/topic/notifications', (message: Message) => {
              this.messageSubject.next(message);
            });
          },
        });

        this.stompClient.activate();
        // Cleanup on unsubscribe
        return () => {
          this.stompClient.deactivate();
        };
      });
    }
    _disconnect() {
      if (this.stompClient !== null) {
        this.stompClient.deactivate();
      }
      console.log("Disconnected");
    }

    // on error, schedule a reconnection attempt
    errorCallBack(error: string) {
        console.log("errorCallBack -> " + error)
        setTimeout(() => {
            this._connect();
        }, 5000);
    }

	/**
	 * Send message to sever via web socket
	 * @param {*} message
	 */
    /*_send(message: string) {
        console.log("calling logout api via web socket");
        this.stompClient.send("/app/hello", {}, JSON.stringify(message));
    }*/
  sendMessage(message: string): void {
    this.stompClient.publish({
      destination: "localhost:8080/gs-guide-websocket/app/hello",
      body: message,
    });
  }
  getMessageObservable(): Observable<Message> {
    return this.messageSubject.asObservable();
  }
}
