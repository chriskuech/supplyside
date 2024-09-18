import { OpenAI } from 'openai'
import singleton from './singleton'

const openai = singleton(
  'openai',
  () =>
    new OpenAI({
      // These are required to use our specific model
      organization: 'org-u3vWSqIyPWvKu4xGpMEcH5l4',
      project: 'proj_RYX76NcxQN2NpLHkQuH7l33b',
    }),
)

export default openai
