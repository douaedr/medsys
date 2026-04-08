import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../context/AuthContext'
import { patientApi } from '../api/api'
import { colors, radius, shadow } from '../theme'

export default function HomeScreen() {
  const { user } = useAuth()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger le profil complet depuis ms-patient-personnel
    patientApi.me()
      .then(res => setPatient(res.data))
      .catch(() => setPatient(null))
      .finally(() => setLoading(false))
  }, [])

  // Les données du profil patient (ms-patient) enrichissent le contexte auth
  const displayData = patient || user

  const cards = [
    { icon: '📋', title: 'Mon dossier', sub: 'Informations médicales', color: colors.primaryLight },
    { icon: '📅', title: 'Rendez-vous', sub: 'Prochains RDV', color: colors.successLight },
    { icon: '🧪', title: 'Analyses', sub: 'Résultats & suivi', color: colors.warningLight },
  ]

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Banner */}
      <LinearGradient colors={['#1e3a8a', '#2563eb', '#0891b2']} style={styles.banner}>
        <View style={styles.bannerAvatar}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontSize: 22, fontWeight: '800', color: 'white' }}>
              {displayData?.prenom?.[0]}{displayData?.nom?.[0]}
            </Text>
          )}
        </View>
        <Text style={styles.bannerGreeting}>Bonjour, {displayData?.prenom} 👋</Text>
        <Text style={styles.bannerSub}>Votre espace santé personnel</Text>
        <View style={styles.cinBadge}>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' }}>
            🪪 ID: {patient?.id || user?.patientId || '—'}
          </Text>
        </View>
      </LinearGradient>

      <View style={{ padding: 16 }}>
        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <View style={styles.quickGrid}>
          {cards.map((card, i) => (
            <TouchableOpacity key={i} style={[styles.quickCard, shadow.sm]}>
              <View style={[styles.quickIcon, { backgroundColor: card.color }]}>
                <Text style={{ fontSize: 22 }}>{card.icon}</Text>
              </View>
              <Text style={styles.quickTitle}>{card.title}</Text>
              <Text style={styles.quickSub}>{card.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info card */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Mes informations</Text>
        <View style={[styles.infoCard, shadow.sm]}>
          {loading ? (
            <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />
          ) : (
            [
              ['Nom complet', `${displayData?.prenom || ''} ${displayData?.nom || ''}`.trim()],
              ['Email', displayData?.email],
              ['Téléphone', patient?.telephone || '—'],
              ['Rôle', user?.role],
            ].map(([k, v]) => (
              <View key={k} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{k}</Text>
                <Text style={styles.infoValue}>{v}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  banner: { padding: 24, paddingTop: 48, alignItems: 'center' },
  bannerAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  bannerGreeting: { fontSize: 22, fontWeight: '800', color: 'white', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  cinBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.dark, marginBottom: 12 },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickCard: { flex: 1, backgroundColor: 'white', borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickTitle: { fontSize: 13, fontWeight: '700', color: colors.dark, marginBottom: 3 },
  quickSub: { fontSize: 11, color: colors.gray },
  infoCard: { backgroundColor: 'white', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderColor: colors.grayLight },
  infoLabel: { fontSize: 13, color: colors.gray },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.dark, maxWidth: '60%', textAlign: 'right' },
})
