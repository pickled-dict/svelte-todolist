import { setupServer } from "msw/node"
import { rest } from "msw"
import type { Todo } from "$lib/interfaces"
import { AUTH_ROUTE } from "$lib/constants"

export const mockedTodoLists = [
  {
    id: 1,
    title: "some todolist",
    todos: [
      {
        id: 1,
        content: "some todo",
        complete: false
      }
    ]
  }
]

export const restHandlers = [
  rest.post(AUTH_ROUTE, async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({someResponse: "hello"}))
  }),
  rest.post("http://localhost:8080/api/auth/signin", async(req, res, ctx) => {
    return res(ctx.status(200), ctx.json({token: "some token123"}))
  }),
  rest.post("http://localhost:8080/api/todolist/all", async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockedTodoLists))
  }),
  rest.put("http://localhost:8080/api/todolist/:id", async (req, res, ctx) => {
    const todoLists = structuredClone(mockedTodoLists);
    todoLists[0].title = (req.body as unknown as {title: string}).title;
    return res(ctx.status(200), ctx.json(todoLists))
  }),
  rest.post("http://localhost:8080/api/todolist/:id/todo", async (req, res, ctx) => {
    const {content, complete} = (req.body as unknown as Todo);
    return res(ctx.status(201), ctx.json({id: 2, content, complete}));
  }),
  rest.delete("http://localhost:8080/api/todo/:id", async (req, res, ctx) => {
    console.log("reached")
    return res(ctx.status(200), ctx.json({message: "todo deleted"}));
  })
]

export const server = setupServer(...restHandlers);
