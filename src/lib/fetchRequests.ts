type RequestMethod = "GET" | "POST" | "PUT" | "DELETE"

export async function sendRequest(requestBody: unknown, requestMethod: RequestMethod) {
  return fetch("http://localhost:8080/api/auth/signin", {
    method: requestMethod,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody),
  })
}
