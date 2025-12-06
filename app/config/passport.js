const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserService = require('../services/user.service');
const MongoDB = require('../utils/mongodb.util');

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userService = new UserService(MongoDB.client);
        const user = await userService.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userService = new UserService(MongoDB.client);
                
                // Tìm user theo Google ID
                let user = await userService.findByGoogleId(profile.id);

                if (user) {
                    // User đã tồn tại, return user
                    return done(null, user);
                }

                // Kiểm tra xem email đã được đăng ký chưa
                const existingUser = await userService.findByEmail(profile.emails[0].value);
                
                if (existingUser) {
                    // Email đã tồn tại, link Google account với user hiện tại
                    const updatedUser = await userService.update(existingUser._id, {
                        googleId: profile.id,
                        avatar: existingUser.avatar || profile.photos[0]?.value || ''
                    });
                    return done(null, updatedUser);
                }

                // Tạo user mới từ Google profile
                const newUser = {
                    googleId: profile.id,
                    username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
                    email: profile.emails[0].value,
                    fullName: profile.displayName || '',
                    avatar: profile.photos[0]?.value || '',
                    role: 'user',
                    isActive: true,
                    password: '' // Google users không cần password
                };

                user = await userService.create(newUser);
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

module.exports = passport;
