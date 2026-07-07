import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { config } from './env';
import User from '../modules/user/user.model';

interface JwtPayload {
  sub: string;
  role: string;
}

const jwtOptions: StrategyOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (
  payload: JwtPayload,
  done: (error: unknown, user?: Express.User | false) => void
) => {
  try {
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
