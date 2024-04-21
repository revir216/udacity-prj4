
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {createLogger} from "../../utils/logger.mjs";
import {v4 as uuidv4} from 'uuid'
import {createResponse} from "../../utils/commonResponseObject.mjs";
import {checkExistingTodo, getUserId} from "../utils.mjs";
import {createXrayDBClient} from "../../database/dbXray.js";

const log = createLogger("image-url-processing")
const dbClient = createXrayDBClient();
const imagesTable = process.env.IMAGES_TABLE;

const bucketName = process.env.S3_BUCKET;
const urlExpiration = parseInt(process.env.URL_EXPIRATION ?? '300');
const s3Client = new S3Client();


export async function handler(event) {
  const todoId = event.pathParameters.todoId;
  if (!todoId) {
    return createResponse(400, {message: 'Error generating URL, todoId is required!!'})
  }

  const userId = getUserId(event);
  await checkExistingTodo({userId, todoId},dbClient);

  const imageId = uuidv4();
  log.info(`Generating image pre-signed url id: ${imageId}`)
  const ext = JSON.parse(event.body);
  const uploadUrl = await getUploadUrl(imageId, ext);
  log.info(`Image pre-signed url generated: { id: ${imageId} }`);
  await createImage({imageId, todoId, uploadUrl, ...ext})

  return createResponse(201, {uploadUrl})
}

const createImage = async (image) => {
  try {
    log.info(`Creating image: { id: ${image.imageId}}`);
    await dbClient.put({
      TableName: imagesTable,
      Item: image
    })
    return image;
  } catch (e) {
    log.error(`Error creating image -  id: ${image.imageId}, message: ${e.message}`);
    throw e;
  }
}


const getUploadUrl = async (imageId, {ext}) => {
  const s3putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageId + '.' + ext,
    ContentType: "image/png"
  })
  return await getSignedUrl(s3Client, s3putCommand, {
    expiresIn: urlExpiration
  });
}
