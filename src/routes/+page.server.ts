import { AUTH_ROUTE } from "$lib/constants";
import type { PageServerLoadEvent } from "./$types";

export async function load({cookies, fetch}: PageServerLoadEvent) {
  const token = cookies.get('token')

  // if no cookie exists return unverified
  if (!token) {
    return {
      verified: false
    }
  }

  // verify if cookie is valid on the server
  return await fetch(AUTH_ROUTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({token: token})
  }).then(async (res) => {
      if (!res.ok) {
        throw new Error((await res.json()).message)
      }
      return await res.json();
    }).then(() => {
      return {
        verified: true
      }
    }).catch(() => {
      return {
        verified: false
      }
    })
}
