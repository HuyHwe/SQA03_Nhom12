import { Injectable } from '@angular/core';

/**
 * Handles all business logic relating to setting and getting local storage items.
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): any | null {
    const item: string | null = localStorage.getItem(key);
    return item !== null && item !== 'undefined' ? (JSON.parse(item)) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clearAll() {
    localStorage.clear();
  }
}
