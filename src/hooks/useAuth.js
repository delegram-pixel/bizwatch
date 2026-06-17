import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../store/authSlice.js'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)

  function logout() {
    dispatch(logoutUser())
  }

  return { user, loading, error, logout }
}
