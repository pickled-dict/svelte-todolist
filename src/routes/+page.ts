import { sendGetRequest } from "$lib/fetchRequests";
import { signedIn } from "$lib/store";
import Cookies from "js-cookie";
import type { PageLoadEvent } from "./$types";
import type { TodoList } from "$lib/interfaces";
import { todoLists, currentTodoList } from "$lib/store";
import { TODOLIST_ROUTE } from "$lib/constants";

export async function load({parent, data}: PageLoadEvent) {
  await parent();

  if (data.verified) {
    signedIn.set(true)

    sendGetRequest(TODOLIST_ROUTE + "/all", Cookies.get("token"))
      .then((res) => res.json() as unknown as Array<TodoList>)
      .then((data) => {
        if (data.length > 0) {
          currentTodoList.set(data[0])
        }
        todoLists.set(data);
      })
      .catch((err) => console.error(err))
  } else {
    signedIn.set(false)
  }
}
