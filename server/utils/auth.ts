import { createError, useRuntimeConfig } from "#imports";
import { CookieSerializeOptions, H3Event, deleteCookie, getCookie, setCookie } from "h3";
import prisma from "#shared/prisma";

export interface SessionUser {
  id: number
  email: string
  name: string | null
  role: 'MANAGER' | 'WAREHOUSE'
}

const SESSION_COOKIE_NAME = 'session_user_id'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

declare module 'h3' {
  interface H3EventContext {
    sessionUser?: SessionUser | null
  }
}

type SessionCookieConfig = {
  path?: string
  sameSite?: 'strict' | 'lax' | 'none'
  secure?: boolean
  domain?: string
  maxAge?: number
}

function resolveCookieOptions(event: H3Event): CookieSerializeOptions {
  const config = useRuntimeConfig(event)
  const sessionCookie = (config.sessionCookie ?? {}) as SessionCookieConfig
  const sameSite = sessionCookie.sameSite ?? 'strict'

  return {
    httpOnly: true,
    sameSite,
    secure: sessionCookie.secure ?? process.env.NODE_ENV === 'production',
    path: sessionCookie.path ?? '/',
    domain: sessionCookie.domain,
    maxAge: sessionCookie.maxAge ?? SESSION_MAX_AGE_SECONDS,
  }
}

export async function getSessionUser(event: H3Event): Promise<SessionUser | null> {
  if ('sessionUser' in event.context) {
    return event.context.sessionUser
  }

  const userId = getCookie(event, SESSION_COOKIE_NAME)
  
  if (!userId) {
    event.context.sessionUser = null
    return null
  }

  const userIdNum = Number.parseInt(userId, 10)
  if (!Number.isSafeInteger(userIdNum) || userIdNum <= 0) {
    event.context.sessionUser = null
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userIdNum }
  })

  if (!user) {
    event.context.sessionUser = null
    return null
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }

  event.context.sessionUser = sessionUser
  return sessionUser
}

export async function requireAuth(event: H3Event): Promise<SessionUser> {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  return user
}

export async function requireRole(event: H3Event, role: 'MANAGER' | 'WAREHOUSE'): Promise<SessionUser> {
  const user = await requireAuth(event)
  if (user.role !== role) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Insufficient permissions'
    })
  }
  return user
}

export function setSession(event: H3Event, userId: number, sessionUser?: SessionUser) {
  const cookieOptions = resolveCookieOptions(event)
  setCookie(event, SESSION_COOKIE_NAME, userId.toString(), cookieOptions)

  if (sessionUser) {
    event.context.sessionUser = sessionUser
  } else if ('sessionUser' in event.context) {
    delete (event.context as Record<string, unknown>).sessionUser
  }
}

export function removeUserSession(event: H3Event) {
  const cookieOptions = resolveCookieOptions(event)
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: cookieOptions.path,
    domain: cookieOptions.domain,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
  })
  event.context.sessionUser = null
}
