import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  CONFIGURATION IP — À MODIFIER AVANT DE LANCER L'APPLICATION
// ─────────────────────────────────────────────────────────────────────────────
//
//  Comment trouver votre IP locale :
//    Windows  → Ouvrir cmd, taper : ipconfig
//               Chercher "Adresse IPv4" (ex: 192.168.1.42)
//    Linux    → Ouvrir terminal, taper : ip addr show
//               ou : hostname -I
//    Mac      → Ouvrir terminal, taper : ifconfig en0
//
//  L'IP doit être celle de la machine qui fait tourner ms-auth et ms-patient.
//  NE PAS utiliser "localhost" ni "127.0.0.1" depuis un téléphone physique.
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_IP = '192.168.1.X' // ← CHANGER ICI par votre IP locale (ex: '192.168.1.42')

const AUTH_BASE = `http://${LOCAL_IP}:8082/api/v1`
const PATIENT_BASE = `http://${LOCAL_IP}:8081/api/v1`

const authAxios = axios.create({ baseURL: AUTH_BASE })
const patientAxios = axios.create({ baseURL: PATIENT_BASE })

// Intercepteur : ajoute le token JWT à chaque requête
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('medsys_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
}
addAuthInterceptor(authAxios)
addAuthInterceptor(patientAxios)

export const authApi = {
  login: (data) => authAxios.post('/auth/login', data),
  register: (data) => authAxios.post('/auth/register', data),
  forgotPassword: (email) => authAxios.post('/auth/forgot-password', { email }),
  resetPassword: (data) => authAxios.post('/auth/reset-password', data),
  me: () => authAxios.get('/auth/me'),
}

export const patientApi = {
  me: () => patientAxios.get('/patient/me'),
}
