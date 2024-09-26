import { injectable } from 'inversify'
import { OpenAI } from 'openai'

@injectable()
export class OpenAiService extends OpenAI {
  constructor() {
    super({
      // These are required to use our specific model
      organization: 'org-u3vWSqIyPWvKu4xGpMEcH5l4',
      project: 'proj_RYX76NcxQN2NpLHkQuH7l33b',
    })
  }
}
