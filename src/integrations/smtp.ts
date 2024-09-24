import { ServerClient } from 'postmark'
import config from '@/integrations/config'
import singleton from '@/integrations/singleton'

const smtp = singleton(
  'smtp',
  () => new ServerClient(config().POSTMARK_API_KEY),
)

export default smtp
