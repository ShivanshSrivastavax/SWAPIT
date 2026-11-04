import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let firebaseApp

export function isFirebaseConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID)
}

function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    const error = new Error('Firebase is not configured. Set FIREBASE_PROJECT_ID.')
    error.status = 503
    throw error
  }

  if (!firebaseApp) {
    firebaseApp = getApps()[0] || initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  }

  return firebaseApp
}

export function getAdminAuth() {
  return getAuth(getFirebaseApp())
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp())
}
