// import dotenv from 'dotenv';
// import express from 'express';
// import jwt from 'jsonwebtoken';
// import cors from 'cors';  // Füge cors import hinzu

// dotenv.config();

// const app = express();
// let refreshTokens = [];

// // Aktiviere CORS
// app.use(cors());
// app.use(express.json());

// app.post('/token', (req, res) =>{
//     const refreshToken = req.body.token
//     if(refreshToken == null) return res.sendStatus(401)
//     if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
//         if(err) return res.sendStatus(403)
//         const accessToken = generateAccessToken({name: user.name})
//         res.json({accessToken: accessToken})
//     })
// })

// app.delete('/logout', (req, res) =>{
//     refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//     res.sendStatus(204)
// })

// app.post('/login', (req, res) =>{
//     //Authenticate User
//     const username = req.body.username
//     const user = {name: username}

//     const accessToken = generateAccessToken(user)
//     const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
//     refreshTokens.push(refreshToken)
//     res.json({accessToken: accessToken, refreshToken: refreshToken})
// })

// function generateAccessToken(user){
//     return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30s'})
// }

//app.listen(4050)

console.log('Server is not running on http://localhost:4050 due to no input');