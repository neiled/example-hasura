import jwt from 'jsonwebtoken';
import { setTokenCookie } from '../../lib/cookies';

export default async function user(req, res) {
  try {
    if (!req.cookies.token) return res.json({ user: null });
    let token = req.cookies.token;
    let user = jwt.verify(token, process.env.JWT_SECRET);
    let { issuer, publicAddress, email } = user;
    let newToken = jwt.sign(
      {
        issuer,
        publicAddress,
        email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // one week
        'https://hasura.io/jwt/claims': {
          'x-hasura-allowed-roles': ['user'],
          'x-hasura-default-role': 'user',
          'x-hasura-user-id': `${issuer}`,
        },
      },
      process.env.JWT_SECRET
    );
    user.token = newToken; // send JWT in response to the client, necessary for API requests to Hasrua
    setTokenCookie(res, newToken);
    res.status(200).json({ user });
  } catch (error) {
    res.status(200).json({ user: null });
  }
}
