import passport from 'passport';
import { BearerStrategy, IBearerStrategyOptionWithRequest } from 'passport-azure-ad';

const options: IBearerStrategyOptionWithRequest = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.CLIENT_ID!,
  audience: process.env.AUDIENCE!,
  validateIssuer: true,
  loggingLevel: 'info',
  passReqToCallback: false,
};

passport.use(new BearerStrategy(options, (token:any, done:any) => {
  return done(null, token); // token is decoded JWT
}));

export default passport;
