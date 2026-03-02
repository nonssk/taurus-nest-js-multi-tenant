import { Global, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

export const REQUEST_TENANT = 'REQUEST_TENANT';

@Global()
@Module({
  providers: [
    {
      provide: REQUEST_TENANT,
      scope: Scope.REQUEST,
      inject: [REQUEST],
      useFactory: async (req: any) => {
        const tenant = req.headers['tenant'];
        if (!tenant) {
          throw new Error('Missing tenant header');
        }
        return tenant as string;
      },
    },
  ],
  exports: [REQUEST_TENANT],
})
export class TenantModule {}
