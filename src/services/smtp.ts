import { ServerClient } from 'postmark'
import config from '@/services/config'
import singleton from '@/services/singleton'
import 'server-only'

const smtp = singleton(
  'smtp',
  () => new ServerClient(config().POSTMARK_API_KEY),
)

export default smtp
