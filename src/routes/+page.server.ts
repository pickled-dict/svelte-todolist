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
  return await fetch("http://localhost:8080/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({token: token})
  }).then(async (res) => {
      if (!res.ok) {
        throw new Error((await res.json()).message)
      }
      return res;
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
