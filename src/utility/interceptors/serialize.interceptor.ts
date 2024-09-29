import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { map, Observable } from "rxjs";

export function SerializeIncludes(dto: any) {
    return UseInterceptors(new SerializeInterceptor(dto))
}
export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: any) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('Before...');
        const now = Date.now();
        return next.handle().pipe(
            map((data: any) => {
              return plainToClass(this.dto,data,{exposeUnsetFields:true})
            })
        );
    }
}