import { getAdminAuth, getFirestoreDb } from '../lib/firebase.js'

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

async function decodeRequestToken(req) {
  const token = getBearerToken(req)
  if (!token) {
    const error = new Error('Missing Firebase ID token.')
    error.status = 401
    throw error
  }
  try {
    return await getAdminAuth().verifyIdToken(token)
  } catch (error) {
    if (error.status) throw error
    const invalidTokenCodes = new Set([
      'auth/argument-error',
      'auth/id-token-expired',
      'auth/id-token-revoked',
      'auth/invalid-id-token',
    ])
    error.status = invalidTokenCodes.has(error.code) ? 401 : 503
    throw error
  }
}

export function verifyFirebaseToken(req, res, next) {
  decodeRequestToken(req)
    .then((decoded) => {
      req.firebaseUser = decoded
      next()
    })
    .catch((error) => {
      if (error.status === 503) {
        return res.status(503).json({ error: 'Firebase Authentication is unavailable. Check the server Firebase configuration.' })
      }
      if (error.status === 401) return res.status(401).json({ error: 'Invalid or expired Firebase ID token.' })
      next(error)
    })
}

export function requireAuth(req, res, next) {
  decodeRequestToken(req)
    .then(async (decoded) => {
      const snapshot = await getFirestoreDb().collection('users').doc(decoded.uid).get()
      if (!snapshot.exists) {
        const error = new Error('Account profile not found.')
        error.status = 403
        throw error
      }

      const profile = snapshot.data()
      req.user = {
        id: decoded.uid,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar ?? null,
      }
      next()
    })
    .catch((error) => {
      if (error.status === 503) {
        return res.status(503).json({ error: 'Firebase Authentication or Firestore is unavailable. Check the server Firebase configuration.' })
      }
      if (error.status) return res.status(error.status).json({ error: error.message })
      next(error)
    })
}
