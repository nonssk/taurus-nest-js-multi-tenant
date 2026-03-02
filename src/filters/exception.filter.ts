import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomError } from 'src/customs';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let data = undefined;

    if (exception instanceof Error) {
      message = exception.message || message;
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || message;
    }

    if (exception instanceof CustomError) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || message;
      data = res.data;
    }

    response.status(status).json({
      code: status.toString(),
      message: message,
      data,
    });
  }
}
