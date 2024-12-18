import Cookie from 'cookie-universal'
import { RefreshApiResponse } from '../pages/login/login'

/**
 * Fetcher is a wrapper around fetch that adds the necessary headers and handles token refresh
 * @param url The url to fetch
 * @param init The request init options
 * @returns The response from the fetch
 */
const fetcher = <T>(url: string, init?: RequestInit): Promise<T> =>
  fetch(url, init)
    .then(async res => {
      // Check if response is ok
      if (res.status == 498) {
        // If not, check if we are already retrying
        if (init && init.headers) {
          throw new Error('Unable to refresh token')
        }

        // Access refresh token via local storage
        const refreshToken = localStorage.getItem('refreshToken')

        // Token expired, refresh it and retry the request using recursion
        return fetch('/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        })
          .then(refreshRes => refreshRes.json() as Promise<RefreshApiResponse>)
          .then(refreshRes => {
            if (refreshRes.success && refreshRes.data) {
              // Update the new access token in cookies
              const cookie = Cookie()
              cookie.set('token', refreshRes.data.token)

              // Retry the request
              return fetcher<T>(url, {
                ...init,
                headers: {
                  ...init?.headers,
                },
              })
            } else {
              throw new Error('Unable to refresh token')
            }
          })
      } else if (!res.ok) {
        throw new Error(res.statusText)
      } else {
        return res.json() as Promise<T>
      }
    })
    .catch(err => {
      throw new Error(err)
    })

export default fetcher
