require('dotenv').config();

// Import the Nodemailer library
const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: 587,
  secure: false, // use SSL
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS,
  }
});

// Configure the mailoptions object


const hmtlMessage = `
<h1>Your optimised files are now ready for download!</h1>
<a href="localhost/user-id/downloads">Go to the downloads page</a>
`

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: process.env.GMAIL_USER,
  subject: 'Sending Email using Node.js',
  text: 'That was easy!',
  html: hmtlMessage
};

// Send the email
transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});