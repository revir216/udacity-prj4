import {createResponse} from "../../utils/commonResponseObject.mjs";
import {createLogger} from "../../utils/logger.mjs";
import {getUserId,checkExistingTodo} from "../utils.mjs";
import {createXrayDBClient} from "../../database/dbXray.js";

const log = createLogger("update-todos")
const dbClient = createXrayDBClient();
const todosTable = process.env.TODOS_TABLE;


export async function updateTodoHandler(event) {
  const todoId = event.pathParameters.todoId

  if (!todoId) {
    return createResponse(400, {message: 'Error updating todo, todoId is required'})
  }
  const userId = getUserId(event);
  await checkExistingTodo({userId, todoId},dbClient);
  const requestBody = JSON.parse(event.body)

  try {
    log.info(`Updating todo id: ${todoId}, userId ${userId}`)
    await dbClient.update({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: "set #name = :name, #done = :done, #dueDate = :dueDate",
      ExpressionAttributeNames: {
        "#name": "name",
        "#done": "done",
        "#dueDate": "dueDate"
      },
      ExpressionAttributeValues: {
        ":name": requestBody.name,
        ":done": requestBody.done,
        ":dueDate": requestBody.dueDate,
      }
    })
    log.info(`Todo updated: {id: ${todoId}, userId ${userId}}`)
    return createResponse(200, {item: requestBody})
  } catch (e) {
    log.error(e)
    log.error(`Error updating todo - userId: ${userId}, message: ${e.message}`)
    return createResponse(500, {message: "Internal server error"})
  }
}