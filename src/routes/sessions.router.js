import { Router } from "express";
import userModel from "../dao/models/users.js";
import passport from "passport";

const router = Router();


/* router.post('/register', passport.authenticate('register', { failureRedirect: '/failRegister' }), async (req, res) => {
    res.send({ status: "success", message: "User Register" })
})

//en caso de que falle el registro
router.get('/failRegister', async (req, res) => {
    res.send({ error: "failed" })
}) */

// Registrar un usuario
router.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(400).json({ error: info.message });
        }
        return res.json({ status: "success", message: "User Register" });
    })(req, res, next);
});

// En caso de que falle el registro
router.get('/failRegister', async (req, res) => {
    res.send({ error: "failed" });
});



//Login Passport
router.post('/login', passport.authenticate('login', { failureRedirect: '/failLogin' }), async (req, res) => {

    const user = req.user;

    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role
    };


    res.send({ status: "success", payload: req.session.user, message: "Inicio de sesión exitoso" });
});

//en caso de que falle el login
router.get('/failLogin', async (req, res) => {
    res.send({ error: "failed" })
})

router.post('/resetPassword', passport.authenticate('resetPassword', { failureRedirect: '/failResetPassword' }), async (req, res) => {
    res.send({ status: "success", message: "Contraseña restaurada" });
});

router.get('/github', passport.authenticate('github', { scope: ['user: email'] }), async (req, res) => {

})

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: "/login" }), async (req, res) => {
    req.session.user = req.user
    res.redirect('/profile')
})

router.post('/logout', async (req, res) => {
    try {
        // Eliminar la sesión de la base de datos (en este caso, utilizando el email del usuario)
        const { email } = req.session.user;
        await userModel.findOneAndUpdate({ email }, { $unset: { session: 1 } });

        // Destruir la sesión en el servidor
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar la sesión:', err);
                return res.status(500).json({ status: 'error', error: 'Error al cerrar la sesión' });
            }

            // Enviar una respuesta exitosa
            return res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
        });
    } catch (err) {
        console.error('Error al cerrar la sesión:', err);
        res.status(500).json({ status: 'error', error: 'Error al cerrar la sesión' });
    }
});

//Peticiones anteriores con hast pero no usando estrategia
/* router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password, role } = req.body;
    const exist = await userModel.findOne({ email });

    if (exist) return res.status(400).send({ status: "error", error: "Users already exists" })

    const user = {
        first_name,
        last_name,
        email,
        age,
        password: createHast(password),
        role
    }
    let result = await userModel.create(user)
    res.send({ status: "success", message: "User registered" })
}) */

/* router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).send({ status: "error", error: "Incorrect credentials" });
    }

    // Use the isValidPassword function to check if the provided password is valid
    const isValid = isValidPassword(user, password);

    if (!isValid) {
        return res.status(400).send({ status: "error", error: "Incorrect credentials" });
    }

    console.log(req.session.user)
    // Password is valid, set session and send success response
    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role
    };
    res.send({ status: "success", payload: req.session.user, message: "Nuestro primer logueo" });
}); */

/* router.post('/resetPassword', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete Values" });
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).send({ status: "error", error: "Not user found" });
    const newHashedPassword = createHast(password);
    await userModel.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } });

    res.send({ status: "success", message: "Contraseña restaurada" });
}) */


export default router;