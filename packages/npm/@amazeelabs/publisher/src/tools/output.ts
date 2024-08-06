import { Subject } from 'rxjs';

type Severity = 'info' | 'warning' | 'error' | 'success';

export class OutputSubject extends Subject<string> {
  next(value: string, severity?: Severity): void {
    const formatted = `${prefix(severity)}${value}`;
    super.next(formatted.endsWith('\n') ? formatted : formatted + '\n');
  }
}

const prefix = (severity: Severity | undefined): string => {
  switch (severity) {
    case 'info':
      return 'ℹ️ ';
    case 'warning':
      return '⚠️ ';
    case 'error':
      return '❌ ';
    case 'success':
      return '✅ ';
    case undefined:
      return '';
  }
};
