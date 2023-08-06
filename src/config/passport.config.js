import passport from 'passport';
import local from 'passport-local';
import userModel from '../dao/models/users.js'
import { createHast, isValidPassword } from '../utils.js'

const localStrategy = local.Strategy;

const initializedPassport = () => {

    passport.use('register', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;
            try {
                let user = await userModel.findOne({ email: username });
                if (user) {
                    return done(null, false, { message: 'Correo electrónico ya registrado' });
                }
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHast(password)
                };
                let result = await userModel.create(newUser);
                return done(null, result);
            } catch (error) {
                return done("Error de usuario" + error);
            }
        }
    ));

    passport.use('login', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
                if (!isValidPassword(user, password)) {
                    return done(null, false, { message: 'Contraseña incorrecta' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.use('resetPassword', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }

                // Actualizar la contraseña en la base de datos
                const newHashedPassword = createHast(password);
                await userModel.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } });

                // Retorna el usuario actualizado (opcional)
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id)
        done(null, user)
    })
}

export default initializedPassport;