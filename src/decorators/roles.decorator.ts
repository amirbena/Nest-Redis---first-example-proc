import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/enums';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
