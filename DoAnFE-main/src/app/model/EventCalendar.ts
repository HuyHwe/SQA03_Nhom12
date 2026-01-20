export class EventCalendar {
  title: string;
  start: string;
  end: string;
  id: string;
  constructor(title: string = '', start: string = '', end: string = '', id: string = '') {
    this.title = title;
    this.start = start;
    this.end = end;
    this.id = id;
  }
}
