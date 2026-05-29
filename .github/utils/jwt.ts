import { jwtDecode } from 'jwt-decode'

export const getTokenExpiration = (token: string): number => {
  try {
    const decoded: any = jwtDecode(token)

    if (!decoded.exp) {
      return 0
    }

    return decoded.exp * 1000
  } catch {
    return 0
  }
}
