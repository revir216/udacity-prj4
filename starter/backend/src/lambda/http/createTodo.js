import {createResponse} from "../../utils/commonResponseObject.mjs";
import {v4 as uuidv4} from 'uuid'
import {createLogger} from "../../utils/logger.mjs";
import {getUserId} from "../utils.mjs";
import {createXrayDBClient} from "../../database/dbXray.js";

const log = createLogger("create-todos")
const dbClient = createXrayDBClient();
const todosTable = process.env.TODOS_TABLE;

export async function createTodoHandler(event) {
  const userId = getUserId(event)
  const todoId = uuidv4();
  log.info("Creating todo item with id: ", todoId);
  const requestBody = JSON.parse(event.body)
  const todoItem = {...requestBody, todoId, userId, done: false}
  try {
    await dbClient.put({
      TableName: todosTable,
      Item: todoItem
    })
    log.info(`Todo created: { id: ${todoId}, userId ${userId} }`)
    return createResponse(201, {item: todoItem})
  } catch (e) {
    log.error(e)
    log.error(`Error creating todo - userId ${userId}, message: ${e.message}`)
    return createResponse(500, {message: "Internal server error !!"})
  }
}
