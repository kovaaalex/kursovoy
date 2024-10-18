const bcrypt = require('bcrypt');
const express = require('express')
const cors = require('cors');
const {connectDB, fetchPersons, disconnectDB} = require ('./dbaccess');
//const { generatePassword } = require('./generatePassword');
const app = express()
app.use(cors())
app.use(express.json())
app.post('/api/login', async(req, res) => {
    const {email, password} = req.body
    await connectDB()
    try {
        const myQuery = 'SELECT * FROM person WHERE email = $1'
        const result = await fetchPersons(myQuery, [email])
        const user = result.rows[0]
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(passwordMatch) res.json({ message: 'Login successful', role: user.role })
            else res.status(401).json({ message: 'Invalid password' })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Server error' })
    } finally {
        await disconnectDB()
    }    
})

app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000')
})
