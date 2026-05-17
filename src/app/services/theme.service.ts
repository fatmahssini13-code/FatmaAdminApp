import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'lancy-admin-dark';
  private readonly _dark = new BehaviorSubject<boolean>(this.readStored());

  /** Emits whenever dark mode changes (including initial value). */
  readonly dark$ = this._dark.asObservable();

  constructor() {
    this.applyBody(this._dark.value);
  }

  private readStored(): boolean {
    try {
      return localStorage.getItem(this.storageKey) === '1';
    } catch {
      return false;
    }
  }

  isDark(): boolean {
    return this._dark.value;
  }

  toggle(): void {
    this.setDark(!this._dark.value);
  }

  setDark(on: boolean): void {
    this._dark.next(on);
    try {
      localStorage.setItem(this.storageKey, on ? '1' : '0');
    } catch {
      /* ignore */
    }
    this.applyBody(on);
  }

  private applyBody(on: boolean): void {
    document.body.classList.toggle('dark-mode', on);
  }
}
