import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUserMatches } from '../services/matchService'

export const useMatches = () => {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const fetchMatches = async () => {
        try {
          const userMatches = await getUserMatches(user.uid)
          setMatches(userMatches)
        } catch (error) {
          console.error('Error fetching matches:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchMatches()
    }
  }, [user])

  return { matches, loading }
}