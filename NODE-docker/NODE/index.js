const express = require('express')
const app = express()
const pool = require('./database');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { check, validationResult } = require('express-validator');

app.use(express.json())




app.get('/', (req, res) => {
    try {
        const message = 'Welcome to the API, for the moment we have exposed the endpoint "/users", to get the information of the table users'
        res.status(200).json(message)
    } catch (error) {
        console.log(error)
    }
})

app.get('/users', async (req, res) => {
    try {
        //mariadb connection
        const connection = await pool.getConnection();

        //new query 
        const query = 'select * from users';
        // executing the query
        const results = await connection.query(query)
        // response to the client 
        res.status(200).json(results)
    } catch (error) {
        console.log(error)
    }
});
app.post('/newuser', [check('name').isString(), check('surname').isString(), check('email').isEmail(), check('password').isLength({ min: 5 }), check('phone').isLength({ min: 9 })], async function (req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
       
        const name = req.body.name;
        const surname = req.body.surname;
        const email = req.body.email;
        const password = req.body.password;

        const phone = req.body.phone;
        let isAdmin = null;
        if (!req.body.isAdmin) {
            isAdmin = false;
        }
        const hash = await bcrypt.hash(password, saltRounds);

        const user = await [name, surname, email, hash, phone, isAdmin];

        //mariadb connection
        const connection = await pool.getConnection();

        //new query 
        const query = 'INSERT INTO users (name, surname, email, password, phone, isAdmin ) VALUES (?, ?, ?, ?, ?, ?)';
        // executing the query
        const results = await connection.query(query, user)
        // response to the client 
        res.status(200).json(results)




    } catch (error) {
        console.log(error)
    }

});
app.post('/login', [check('email').isEmail(), check('password').isLength({ min: 5 })], async function (req, res) {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const email = req.body.email;

        const password = req.body.password;



        //mariadb connection
        const connection = await pool.getConnection();

        //new query 
        const query = 'SELECT * FROM users WHERE email = ?';
        // executing the query
        const results = await connection.query(query, email)
        const dbPassword = results[0].password;
        if (results instanceof (Error)) {
            console.log('No results')


        } else if (dbPassword instanceof (Error)) {
            console.log('No results')

        } else {
            console.log('Register found!')
            const compare = await bcrypt.compare(password, dbPassword)
            // response to the client 
            if (compare === true) {
                res.status(200).json(results)
            } else {
                const message = 'Error in Request, password does not match'
                res.status(400).json(message)
            }

        }
    } catch (error) {
        console.log(error);
    }




})

app.listen(5000, () => console.log("Application served and running"))