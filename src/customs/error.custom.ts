import { HttpException } from '@nestjs/common';

export class CustomError<T> extends HttpException {
  constructor(message: string, status: number, data: T | undefined | null) {
    super(
      {
        code: status,
        message: message,
        data: data,
      },
      status,
    );
  }
}
