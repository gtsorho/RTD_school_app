import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../models';
import passport from './passport.config'
dotenv.config();

const secretKey: string = process.env.JWT_KEY || '';

interface DecodedToken {
    username: string;
    id: string;
    role: string;
}

declare module 'express' {
    interface Request {
        decodedToken?: DecodedToken;
    }
}

// const authenticateToken = (requiredRole: string | string[])  : any => {
//     return (req: ExpressRequest, res: Response, next: NextFunction) => {
//         let token: string | undefined = req.header('Authorization');
//         if (!token) return res.status(401).send('Access denied. No token provided');
//         token = token.split(' ')[1];

//         try {
//             const decoded: DecodedToken = jwt.verify(token, secretKey) as DecodedToken;
            
//             req.decodedToken = decoded;

//             if (Array.isArray(requiredRole)) {
//                 if (!requiredRole.includes(decoded.role)) {
//                     return res.status(403).send('Access denied. User does not have the required role');
//                 }
//             } else {
//                 if (decoded.role !== requiredRole) {
//                     return res.status(403).send('Access denied. User does not have the required role');
//                 }
//             }

//             next();
//         } catch (error) {
//             res.status(400).send('Invalid token');
//         }
//     };
// };
const authenticateToken = (requiredRoles: string | string[]) : any => {
  return async (req: ExpressRequest, res: Response, next: NextFunction) => {
    let token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied. No token provided');
    token = token.split(' ')[1];

    if (isJwt(token)) {
      // 🔐 Handle JWT
      try {
        const decoded: DecodedToken = jwt.verify(token, secretKey) as DecodedToken;
        req.decodedToken = decoded;

        if (!requiredRoles.includes(decoded.role)) {
          return res.status(403).send('Access denied. Insufficient role');
        }

        return next();
      } catch (error) {
        return res.status(400).send('Invalid JWT token');
      }
    } else {
      // 🔐 Handle Azure AD token
      passport.authenticate('oauth-bearer', { session: false }, async (err:any, user:any, info:any) => {
        if (err || !user) return res.status(401).send('Invalid Azure token');

        const oid = user.oid;
        const email = user.email || user.upn || '';
        const name = user.name || user.given_name || '';
        
          const [dbUser] = await db.users.findOrCreate({
            where: { oid: oid },
            defaults: {
              name: name,
              email: email,
              password: Math.random().toString(36).slice(-10), // random string
              role: 'user',
              oid: oid
            }
          });


        if (!dbUser || !requiredRoles.includes(dbUser.role)) {
          return res.status(403).send('Access denied. Insufficient role');
        }

        req.decodedToken = {
          id: dbUser.id,
          username: dbUser.email,
          role: dbUser.role,
        };

        return next();
      })(req, res, next);
    }
  };
};

function isJwtPayload(payload: unknown): payload is jwt.JwtPayload {
  return typeof payload === 'object' && payload !== null && 'iss' in payload;
}

const isJwt = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded !== 'object') return false;

    const payload = decoded.payload;
    if (!isJwtPayload(payload)) return false;

    return payload.aud !== `api://${process.env.CLIENT_ID}`;
  } catch {
    return false;
  }
};



export default authenticateToken;
