export class ApiModel {
  messageLog: string;
  uri: string;
  body: any;
  method: any;
  constructor(messageLog: string, uri: string, body: any, method: any) {
    this.messageLog = messageLog;
    this.uri = uri;
    this.body = body;
    this.method = method;
  }
}
