import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { TaskEvent } from './types';

@Injectable()
export class SseService {
  private connections = new Map<string, Subject<TaskEvent>>();

  subscribe(userId: string): Observable<TaskEvent> {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Subject<TaskEvent>());
    }
    return this.connections.get(userId)!.asObservable();
  }

  emit(userId: string, event: Partial<TaskEvent>) {
    const subject = this.connections.get(userId);
    if (subject) {
      const fullEvent: TaskEvent = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...event,
      } as TaskEvent;
      subject.next(fullEvent);
    }
  }

  remove(userId: string) {
    const subject = this.connections.get(userId);
    if (subject) {
      subject.complete();
      this.connections.delete(userId);
    }
  }
}
