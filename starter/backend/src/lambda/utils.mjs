import {parseUserId} from '../auth/utils.mjs'
import {createResponse} from "../utils/commonResponseObject.mjs";
import {createLogger} from "../utils/logger.mjs";

const logger = createLogger("jwt-parsing")
const todosTable = process.env.TODOS_TABLE;

export function getUserId(event) {
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const uId = parseUserId(jwtToken)
    if (!uId) {
        return createResponse(403, {message: 'Unauthorized'})
    }
    return uId;
}

export const checkExistingTodo = async (keys,dbClient) => {
    const result = await dbClient.get({
        TableName: todosTable,
        Key: {...keys}
    })
    if (!result) {
        return createResponse(404, {message: "Todo not found"});
    }
    return true;
}
