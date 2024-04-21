import {createResponse} from "../../utils/commonResponseObject.mjs";
import {getUserId,checkExistingTodo} from "../utils.mjs";
import {createLogger} from "../../utils/logger.mjs";
import {createXrayDBClient} from "../../database/dbXray.js";


const dbClient = createXrayDBClient();
const log = createLogger("delete-todo")
const todosTable = process.env.TODOS_TABLE;

export async function deleteTodoHandler(event) {
  const todoId = event.pathParameters?.todoId;
  if (!todoId) {
    return createResponse(400, {message: 'Error deleting todo, todoId is required!'})
  }
  const userId = getUserId(event);
  await checkExistingTodo({userId, todoId},dbClient);

  try {
    log.info(`Deleting todo: { id ${todoId}, userId ${userId} }`)
    await dbClient.delete({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    })
    log.info(`Todo Deleted: { id ${todoId}, userId ${userId} }`)
    return createResponse(200, {})
  } catch (e) {
    log.error(e)
    log.error(`Error deleting todo - userId ${userId}, message: ${e.message}`)
    return createResponse(500, {message: "Internal server error !"})
  }
}

