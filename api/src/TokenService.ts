import { inject, injectable } from 'inversify'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { ConfigService } from './ConfigService'

const tokenPayloadSchema = z.object({
  accountId: z.string().uuid(),
  fileId: z.string().uuid(),
})

type TokenPayload = z.infer<typeof tokenPayloadSchema>

@injectable()
export class TokenService {
  constructor(
    @inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  private get symmetricKey() {
    return this.configService.config.API_KEY
  }

  create(payload: TokenPayload): string {
    return jwt.sign(payload, this.symmetricKey, {
      expiresIn: 60 * 60 * 24, // 24 hours,
    })
  }

  parse(rawToken: string): TokenPayload {
    try {
      const decoded = jwt.verify(rawToken, this.symmetricKey)
      return tokenPayloadSchema.parse(decoded)
    } catch (cause) {
      throw new Error('Invalid token', { cause })
    }
  }
}
