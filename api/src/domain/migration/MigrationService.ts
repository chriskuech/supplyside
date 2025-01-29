import { inject, injectable } from 'inversify'
import { ResourceService } from '../resource/ResourceService'
import { SchemaFieldService } from '../schema/SchemaFieldService'
import { MigrationUtilityService } from './MigrationUtilityService'

@injectable()
export class MigrationService {
  constructor(
    @inject(ResourceService) private readonly resources: ResourceService,
    @inject(MigrationUtilityService)
    private readonly utils: MigrationUtilityService,
    @inject(SchemaFieldService) private readonly fields: SchemaFieldService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async migrate(accountId: string) {}
}
