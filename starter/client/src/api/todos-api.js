import Axios from 'axios'
import {config} from "../config/config";

export async function getTodos(idToken) {
    console.log('Fetching todos')

    const response = await Axios.get(
        `${config.endpoint}/todos`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            }
        }
    )
    console.log(config.endpoint)
    console.log('Todos:', response.data)
    return response.data.items
}

export async function createTodo(idToken, newTodo) {
    const response = await Axios.post(
        `${config.endpoint}/todos`,
        JSON.stringify(newTodo),
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            }
        }
    )
    return response.data.item
}

export async function patchTodo(idToken, todoId, updatedTodo) {
    await Axios.patch(
        `${config.endpoint}/todos/${todoId}`,
        JSON.stringify(updatedTodo),
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            }
        }
    )
}

export async function deleteTodo(idToken, todoId) {
    await Axios.delete(`${config.endpoint}/todos/${todoId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`
        }
    })
}

export async function getUploadUrl(idToken, todoId) {
    const response = await Axios.post(
        `${config.endpoint}/todos/${todoId}/attachment`,
        '',
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            }
        }
    )
    return response.data.uploadUrl
}

export async function uploadFile(uploadUrl, file) {
    await Axios.put(uploadUrl, file)
}
