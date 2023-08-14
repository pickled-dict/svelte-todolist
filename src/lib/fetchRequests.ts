export const API_URL = "http://localhost:8080";
export const AUTH = API_URL + "/api/auth";
export const TODOLIST = API_URL + "/api/todolist";

export async function sendPostRequest(url: string, requestBody: unknown, authToken?: string) {
  return authToken ? 
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody),
    }) : fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    })
}

export async function sendGetRequest(url: string, authToken?: string, query?: string) {
  const mutUrl = query ? `${url}/${query}` : url;

  return authToken ?
    fetch(mutUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      }
    }) : fetch(mutUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
}

export async function sendPutRequest(url: string, requestBody: unknown, authToken?: string) {
  return authToken ? 
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify(requestBody),
    }) : fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    })
}
