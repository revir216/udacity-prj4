import jsonwebtoken from 'jsonwebtoken'
import {createLogger} from '../../utils/logger.mjs'

const {verify} = jsonwebtoken;

const logger = createLogger('auth')

const jwksUrl = `https://${process.env.REACT_APP_AUTH0_DOMAIN}/.well-known/jwks.json`

export async function handler(event) {
    try {
        const jwtToken = await verifyToken(event.authorizationToken)

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', {error: e.message})

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

function getToken(authHeader) {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    return authHeader.split(' ')[1]
}


async function verifyToken(authHeader) {
    const token = getToken(authHeader)
    const keyReponse = await fetch(jwksUrl);
    const {keys} = await keyReponse.json();
    const {alg, x5c} = keys[0];
    const cert = `-----BEGIN CERTIFICATE-----
${x5c[0]}
-----END CERTIFICATE-----`
    return verify(token, cert, {algorithms: [alg]})
}

