import { ServerClient } from 'postmark'
import config from '@/services/config'
import singleton from '@/services/singleton'

const smtp = singleton(
  'smtp',
  () => new ServerClient(config().POSTMARK_API_KEY),
)

export default smtp
