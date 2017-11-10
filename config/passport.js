var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Users.findOne({id: id} , function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done) {
    Users.findOne({username: username}, function(err, user) {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, {message: 'Incorrect username.'});
        }

        bcrypt.compare(password, user.password, function(err, res) {
            if (!res) {
                return done(null, false, {message: 'Incorrect password.'});
            }

            var returnUser = {
                username: user.username,
                createdAt: user.createdAt,
                id: user.id
            };

            return done(null, returnUser, {
                message: 'Logged In Successfully'
            });
        });
    });
}
));
