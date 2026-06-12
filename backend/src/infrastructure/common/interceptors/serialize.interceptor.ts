import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => this.stripProps(data)),
        );
    }

    private stripProps(obj: any): any {
        if (obj === null || obj === undefined) return obj;
        if (obj instanceof Date) return obj.toISOString();
        if (Array.isArray(obj)) return obj.map((item) => this.stripProps(item));
        if (typeof obj === 'object') {
            // If this is a domain entity wrapped in { props: {...} }, flatten it
            if ('props' in obj && typeof obj.props === 'object' && obj.props !== null) {
                return this.stripProps(obj.props);
            }
            const result: Record<string, any> = {};
            for (const key of Object.keys(obj)) {
                result[key] = this.stripProps(obj[key]);
            }
            return result;
        }
        return obj;
    }
}
