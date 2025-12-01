import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import type { ConfigService, LoggerService, Service } from '../app.services';
import type { UserService } from '../user';

export interface OAuthService extends Service {
  /**
   * Configure all OAuth strategies
   */
  configureStrategies(): void;
}

export const createOAuthService = (
  config: ConfigService,
  user: UserService,
  logger: LoggerService
): OAuthService => {
  return {
    async initialize() {
      logger.info('OAuth service initialized');
    },

    configureStrategies() {
      // ===================================================================
      // GitHub OAuth Strategy
      // ===================================================================
      const githubClientId = config.get('GITHUB_CLIENT_ID');
      const githubClientSecret = config.get('GITHUB_CLIENT_SECRET');
      const githubCallbackUrl = config.get('GITHUB_CALLBACK_URL');

      if (githubClientId && githubClientSecret && githubCallbackUrl) {
        passport.use(
          new GitHubStrategy(
            {
              clientID: githubClientId,
              clientSecret: githubClientSecret,
              callbackURL: githubCallbackUrl,
              scope: ['user:email'],
            },
            async (
              _accessToken: string,
              _refreshToken: string,
              profile: any,
              done: (error: Error | null, user?: Express.User | false) => void
            ) => {
              try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                  return done(new Error('No email provided by GitHub'));
                }

                const userDoc = await user.findOrCreateUser({
                  provider: 'github',
                  providerId: profile.id,
                  email,
                  name: profile.displayName || profile.username || email,
                  avatar: profile.photos?.[0]?.value,
                  username: profile.username, // GitHub username for verified alias
                });

                const expressUser: Express.User = {
                  id: userDoc._id!,
                  _id: userDoc._id!,
                  email: userDoc.email,
                  displayName: userDoc.name,
                  avatar: userDoc.avatar,
                  verifiedAlias: userDoc.verifiedAlias,
                  providers: userDoc.providers,
                  role: userDoc.role,
                  createdAt: userDoc.createdAt,
                  updatedAt: userDoc.updatedAt,
                };

                logger.info('GitHub OAuth successful', {
                  userId: userDoc._id,
                  email: userDoc.email,
                });

                done(null, expressUser);
              } catch (error) {
                logger.error('GitHub OAuth error', { error });
                done(error as Error);
              }
            }
          )
        );
        logger.info('GitHub OAuth strategy configured');
      } else {
        logger.warn('GitHub OAuth not configured - missing credentials');
      }

      // ===================================================================
      // Google OAuth Strategy
      // ===================================================================
      const googleClientId = config.get('GOOGLE_CLIENT_ID');
      const googleClientSecret = config.get('GOOGLE_CLIENT_SECRET');
      const googleCallbackUrl = config.get('GOOGLE_CALLBACK_URL');

      if (googleClientId && googleClientSecret && googleCallbackUrl) {
        passport.use(
          new GoogleStrategy(
            {
              clientID: googleClientId,
              clientSecret: googleClientSecret,
              callbackURL: googleCallbackUrl,
              scope: ['profile', 'email'],
            },
            async (_accessToken, _refreshToken, profile, done) => {
              try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                  return done(new Error('No email provided by Google'));
                }

                const userDoc = await user.findOrCreateUser({
                  provider: 'google',
                  providerId: profile.id,
                  email,
                  name: profile.displayName || email,
                  avatar: profile.photos?.[0]?.value,
                });

                const expressUser: Express.User = {
                  id: userDoc._id!,
                  _id: userDoc._id!,
                  email: userDoc.email,
                  displayName: userDoc.name,
                  avatar: userDoc.avatar,
                  verifiedAlias: userDoc.verifiedAlias,
                  providers: userDoc.providers,
                  role: userDoc.role,
                  createdAt: userDoc.createdAt,
                  updatedAt: userDoc.updatedAt,
                };

                logger.info('Google OAuth successful', {
                  userId: userDoc._id,
                  email: userDoc.email,
                });

                done(null, expressUser);
              } catch (error) {
                logger.error('Google OAuth error', { error });
                done(error as Error);
              }
            }
          )
        );
        logger.info('Google OAuth strategy configured');
      } else {
        logger.warn('Google OAuth not configured - missing credentials');
      }

      // ===================================================================
      // Microsoft OAuth Strategy
      // ===================================================================
      const microsoftClientId = config.get('MICROSOFT_CLIENT_ID');
      const microsoftClientSecret = config.get('MICROSOFT_CLIENT_SECRET');
      const microsoftCallbackUrl = config.get('MICROSOFT_CALLBACK_URL');

      if (microsoftClientId && microsoftClientSecret && microsoftCallbackUrl) {
        logger.info('Configuring Microsoft OAuth strategy...', {
          clientId: microsoftClientId.substring(0, 8) + '...',
          callbackUrl: microsoftCallbackUrl,
        });

        passport.use(
          new MicrosoftStrategy(
            {
              clientID: microsoftClientId,
              clientSecret: microsoftClientSecret,
              callbackURL: microsoftCallbackUrl,
              scope: ['user.read'],
            },
            async (
              _accessToken: string,
              _refreshToken: string,
              profile: any,
              done: (error: Error | null, user?: Express.User | false) => void
            ) => {
              try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                  return done(new Error('No email provided by Microsoft'));
                }

                const userDoc = await user.findOrCreateUser({
                  provider: 'microsoft',
                  providerId: profile.id,
                  email,
                  name: profile.displayName || email,
                  avatar: profile.photos?.[0]?.value,
                });

                const expressUser: Express.User = {
                  id: userDoc._id!,
                  _id: userDoc._id!,
                  email: userDoc.email,
                  displayName: userDoc.name,
                  avatar: userDoc.avatar,
                  verifiedAlias: userDoc.verifiedAlias,
                  providers: userDoc.providers,
                  role: userDoc.role,
                  createdAt: userDoc.createdAt,
                  updatedAt: userDoc.updatedAt,
                };

                logger.info('Microsoft OAuth successful', {
                  userId: userDoc._id,
                  email: userDoc.email,
                });

                done(null, expressUser);
              } catch (error) {
                logger.error('Microsoft OAuth error', { error });
                done(error as Error);
              }
            }
          )
        );
        logger.info('Microsoft OAuth strategy configured');
      } else {
        logger.warn('Microsoft OAuth not configured - missing credentials', {
          hasClientId: !!microsoftClientId,
          hasClientSecret: !!microsoftClientSecret,
          hasCallbackUrl: !!microsoftCallbackUrl,
        });
      }

      // Passport serialization (not used in stateless JWT, but required by passport)
      passport.serializeUser((user: Express.User, done) => {
        done(null, user.id || user.userId);
      });

      // Passport deserialization (not used in stateless JWT, but required by passport)
      passport.deserializeUser(async (id: string, done) => {
        try {
          const userDoc = await user.getUserById(id);
          if (!userDoc) {
            return done(null, false);
          }

          const expressUser: Express.User = {
            id: userDoc._id!,
            _id: userDoc._id!,
            email: userDoc.email,
            displayName: userDoc.name,
            avatar: userDoc.avatar,
            verifiedAlias: userDoc.verifiedAlias,
            providers: userDoc.providers,
            role: userDoc.role,
            createdAt: userDoc.createdAt,
            updatedAt: userDoc.updatedAt,
          };

          done(null, expressUser);
        } catch (error) {
          logger.error('User deserialization error', { error, userId: id });
          done(error as Error);
        }
      });

      logger.info('OAuth strategies configured');
    },
  };
};
