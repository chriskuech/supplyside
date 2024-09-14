import { OpenAI } from 'openai'
import singleton from './singleton'

const openai = singleton('openai', () => new OpenAI())

export default openai
