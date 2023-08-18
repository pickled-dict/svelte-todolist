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
        "Authorization": `Bearer ${authToken}`,
        "Access-Control-Allow-Origin": "*"
      }
    }) : fetch(mutUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
}

export async function sendPutRequest(url: string, requestBody: unknown, authToken?: string) {
  return authToken ? 
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(requestBody),
    }) : fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(requestBody),
    })
}

export async function sendDeleteRequest(url: string, authToken?: string) {
  return authToken ? 
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        "Access-Control-Allow-Origin": "*"
      },
    }) : fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    })
}
