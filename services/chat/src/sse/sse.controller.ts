import { Controller, Sse, UseGuards, Request } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SseService } from './sse.service';
import { TaskEvent } from './types';

@Controller('api/sse')
@UseGuards(JwtAuthGuard)
export class SseController {
  constructor(private sseService: SseService) {}

  @Sse()
  stream(@Request() req): Observable<MessageEvent> {
    const userId = req.user.userId;

    return new Observable((observer) => {
      const subscription = this.sseService.subscribe(userId).subscribe({
        next: (event: TaskEvent) => {
          observer.next({ data: event } as MessageEvent);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });

      return () => {
        subscription.unsubscribe();
        this.sseService.remove(userId);
      };
    });
  }
}
