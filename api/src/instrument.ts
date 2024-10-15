import Sentry from '@sentry/node'

Sentry.init({
  environment: process.env.SS_ENV,
  enabled: !!process.env.SS_ENV && process.env.SS_ENV !== 'development',

  dsn: 'https://889d72f14e15ac08f76d686aa96f5239@o4507972004610048.ingest.us.sentry.io/4508084675477504',

  // https://sentry.zendesk.com/hc/en-us/articles/23337524872987-Why-is-the-the-message-in-my-error-being-truncated
  maxValueLength: 8192,

  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})
