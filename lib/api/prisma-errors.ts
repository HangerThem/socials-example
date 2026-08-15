import { Prisma } from '@/generated/prisma/client'
import {
  badRequestResponse,
  conflictResponse,
  notFoundResponse,
  payloadTooLargeResponse,
  internalServerErrorResponse,
  serviceUnavailableResponse,
} from '@/lib/api'

/**
 * Maps a Prisma error to an appropriate HTTP response. Handles known
 * request errors (constraint violations, missing records) as well as
 * validation and initialization failures, which have no error `code`.
 */
export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return conflictResponse('A record with this value already exists')
      case 'P2003':
        return badRequestResponse('Invalid reference to a related record')
      case 'P2025':
        return notFoundResponse('Record not found')
      case 'P2000':
        return payloadTooLargeResponse()
      case 'P2011':
      case 'P2012':
        return badRequestResponse('Missing required fields')
      case 'P2014':
      case 'P2017':
      case 'P2018':
        return badRequestResponse('Invalid relation between records')

      // SQLite-specific: SQLITE_BUSY surfaced through the adapter after
      // the busy_timeout window elapsed — the DB was locked too long.
      case 'P2024':
        return serviceUnavailableResponse('Database is busy, try again shortly.')

      default:
        console.error(`Unhandled Prisma error: ${error.code}`, error)
        return internalServerErrorResponse(`Database error: ${error.code}`)
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('Prisma failed to initialize', error)
    return serviceUnavailableResponse('Database is unreachable.')
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('Prisma validation error', error)
    return badRequestResponse('Invalid query or input shape')
  }

  console.error('Unhandled non-Prisma error in handlePrismaError', error)
  return internalServerErrorResponse()
}
