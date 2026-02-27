import { SetMetadata } from '@nestjs/common';

export const Response = (...args: string[]) => SetMetadata('response', args);
