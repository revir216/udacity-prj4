import {createResponse} from "../../utils/commonResponseObject.mjs";
import {createLogger} from "../../utils/logger.mjs";
import {getUserId} from "../utils.mjs";
import {createXrayDBClient} from "../../database/dbXray.js";

const dbClient = createXrayDBClient();
const todosTable = process.env.TODOS_TABLE;
const imagesTable = process.env.IMAGES_TABLE;
const log = createLogger("get-todo");

async function getAllTodoImages(todoList) {
    let imagesList = {Items: []}

    if (todoList.Items.length > 0) {
        log.info(`Getting todos images`)
        const keyConditions = [];
        const valueExpression = {};
        let key = ':tdId';
        todoList.Items.forEach((todo, index) => {
            key += (index + 1);
            keyConditions.push(key);
            valueExpression[key] = todo.todoId
        })

        imagesList = await dbClient.scan({
            TableName: imagesTable,
            FilterExpression: `todoId IN (${keyConditions.join(', ')})`,
            ExpressionAttributeValues: {
                ...valueExpression
            }
        })
    }

    let result = {};
    if (imagesList.Items.length > 0) {
        result = imagesList.Items.reduce((prev, current) => {
            if (!prev[current.todoId]) {
                prev[current.todoId] = [current]
            } else {
                prev[current.todoId].push(current)
            }
            return prev;
        }, {})
    }
    return result;
}

export async function getTodoHandler(event) {
    const uId = getUserId(event);

    log.info(`Getting todoList todos for user ${uId}`)

    let todoList = {Items: []}

    try {
        todoList = await dbClient.query({
            TableName: todosTable,
            ExpressionAttributeValues: {
                ':uId': uId
            },
            KeyConditionExpression: 'userId = :uId'
        })
    } catch (e) {
        log.error(e)
        return createResponse(500, {message: "error"})
    }
    let imageMap = await getAllTodoImages(todoList);

    const items = todoList.Items.map(todo => {
        let todoImages = imageMap[todo.todoId];
        if (todoImages) {
            return {...todo, images: todoImages}
        }
        return {...todo, images: []}
    })
    log.info(`Returning todoList todos with prev images`)
    return createResponse(200, {items})
}
