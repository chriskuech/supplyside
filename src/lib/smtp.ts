'use server'

import { ServerClient } from 'postmark'
import config from '@/lib/config'
import singleton from '@/lib/singleton'

const smtp = singleton(
  'smtp',
  () => new ServerClient(config().POSTMARK_API_KEY),
)

export default smtp
