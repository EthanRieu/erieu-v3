import { createError, defineEventHandler, getRequestHeader, getRequestIP, readBody, setResponseHeader } from 'h3'

/**
 * POST /api/contact — envoi du formulaire de contact via l'API HTTP de Resend.
 *
 * Défenses :
 *  - rate limiting en mémoire : 5 messages par heure et par IP (par instance serverless, suffisant ici) ;
 *  - validation serveur (miroir de la validation client) avec codes d'erreur par champ ;
 *  - honeypot `website` : rempli uniquement par les robots → on répond 200 sans rien envoyer ;
 *  - délai minimal de remplissage (`startedAt`) : un envoi < 3 s après affichage est automatisé ;
 *  - taille de requête plafonnée par nuxt-security (routeRules dans nuxt.config.ts) ;
 *  - la clé Resend ne quitte jamais le serveur (runtimeConfig privé) ;
 *  - le mail est envoyé en texte brut : aucun HTML fourni par l'utilisateur n'est interprété.
 *
 * Note : le rate limiter de nuxt-security n'est pas utilisé car son middleware appelle useStorage()
 * au niveau module, ce que Nitro 2.11 ordonne avant l'initialisation du storage (crash au démarrage).
 */

const MIN_FILL_TIME_MS = 3000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 }

const requestLog = new Map<string, number[]>()

const isRateLimited = (ip: string): boolean => {
  const now = Date.now()
  const recent = (requestLog.get(ip) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT.windowMs)

  if (recent.length >= RATE_LIMIT.max) {
    requestLog.set(ip, recent)
    return true
  }

  recent.push(now)
  requestLog.set(ip, recent)

  // Nettoyage opportuniste pour borner la mémoire
  if (requestLog.size > 1000) {
    for (const [key, timestamps] of requestLog) {
      if (!timestamps.some((timestamp) => now - timestamp < RATE_LIMIT.windowMs)) {
        requestLog.delete(key)
      }
    }
  }
  return false
}

interface ContactBody {
  name?: unknown
  email?: unknown
  message?: unknown
  website?: unknown
  startedAt?: unknown
  locale?: unknown
}

type FieldError = 'required' | 'length' | 'invalid'

const asTrimmedString = (value: unknown, max = 5000): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const validate = (body: ContactBody) => {
  const name = asTrimmedString(body.name)
  const email = asTrimmedString(body.email)
  const message = asTrimmedString(body.message)
  const fields: Partial<Record<'name' | 'email' | 'message', FieldError>> = {}

  if (!name) fields.name = 'required'
  else if (name.length < 2 || name.length > 80) fields.name = 'length'

  if (!email) fields.email = 'required'
  else if (email.length > 254 || !EMAIL_RE.test(email)) fields.email = 'invalid'

  if (!message) fields.message = 'required'
  else if (message.length < 10 || message.length > 2000) fields.message = 'length'

  return { fields, name, email, message }
}

// IP cliente : d'abord les en-têtes posés par la plateforme (non falsifiables par le client),
// puis x-forwarded-for (fiable derrière Vercel/Netlify qui le réécrivent), puis la socket.
const clientIp = (event: Parameters<typeof getRequestIP>[0]): string =>
  getRequestHeader(event, 'x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
  getRequestHeader(event, 'x-nf-client-connection-ip')?.trim() ||
  getRequestIP(event, { xForwardedFor: true }) ||
  'unknown'

export default defineEventHandler(async (event) => {
  const ip = clientIp(event)
  if (isRateLimited(ip)) {
    setResponseHeader(event, 'Retry-After', String(Math.ceil(RATE_LIMIT.windowMs / 1000)))
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests', data: { code: 'rate_limited' } })
  }

  const body = ((await readBody<ContactBody>(event)) ?? {}) as ContactBody

  // Honeypot : on fait croire au succès pour ne pas donner d'indice aux robots.
  if (asTrimmedString(body.website)) {
    return { ok: true }
  }

  const startedAt = Number(body.startedAt)
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_TIME_MS) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { code: 'too_fast' } })
  }

  const { fields, name, email, message } = validate(body)
  if (Object.keys(fields).length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { code: 'invalid', fields } })
  }

  const config = useRuntimeConfig(event)
  if (!config.resendApiKey || !config.contactTo || !config.contactFrom) {
    console.error('[contact] Missing NUXT_RESEND_API_KEY, NUXT_CONTACT_TO or NUXT_CONTACT_FROM')
    throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', data: { code: 'unconfigured' } })
  }

  const locale = asTrimmedString(body.locale, 5) || 'en'
  const safeName = name.replace(/[\r\n\t]+/g, ' ')
  const text = [`Name: ${safeName}`, `Email: ${email}`, `Language: ${locale}`, '', message].join('\n')

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}` },
      body: {
        from: config.contactFrom,
        to: [config.contactTo],
        reply_to: email,
        subject: `[erieu.fr] New message from ${safeName}`,
        text,
      },
    })
  } catch (error) {
    // Détail loggé côté serveur uniquement ; le client reçoit un message générique.
    console.error('[contact] Resend request failed', error)
    throw createError({ statusCode: 502, statusMessage: 'Bad Gateway', data: { code: 'send_failed' } })
  }

  return { ok: true }
})
