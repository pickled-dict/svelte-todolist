import { TODOLIST, sendGetRequest } from "$lib/fetchRequests";
import { signedIn } from "$lib/store";
import Cookies from "js-cookie";
import type { PageLoadEvent } from "./$types";
import type { TodoList } from "$lib/interfaces";
import { todoLists } from "$lib/store";

export async function load({parent, data}: PageLoadEvent) {
  await parent();

  if (data.verified) {
    signedIn.set(true)

    sendGetRequest(TODOLIST + "/all", Cookies.get("token"))
      .then((res) => res.json() as unknown as Array<TodoList>)
      .then((data) => {
        todoLists.set(data);
      })
      .catch((err) => console.error(err))
  } else {
    signedIn.set(false)
  }
}
