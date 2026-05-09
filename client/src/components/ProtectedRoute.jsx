// export default function ProtectedRoute({children}) { return children }

import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, role }) {
  const { user } = useSelector((state) => state.auth)

  // not logged in — redirect to login
  if (!user) {
    return <Navigate to='/login' />
  }

  // wrong role — redirect to home
  if (role && user.role !== role) {
    return <Navigate to='/' />
  }

  return children
}