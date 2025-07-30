const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = 3000;

// --- Middleware ---
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve your static files (HTML, CSS, JS)

// --- Email Configuration ---
// IMPORTANT: Use environment variables in a real application for security.
// Do not hardcode your credentials.
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another service like SendGrid, etc.
    auth: {
        user: 'ronjsch@gmail.com', // Your email address
        pass: 'ppilvlbkxaztsvat'    // Your Gmail App Password (not your regular password)
    }
});

// The mediator's email address
const mediatorEmail = 'ronnie@biamic.com'; 

// --- API Endpoint ---
app.post('/submit-assessment', (req, res) => {
    const { user, part1Ranking, part2Ranking } = req.body;

    // Create an HTML string for the email body
    const resultsHtml = `
        <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Assessment Results for: ${user.name}</h2>
            <p>
                <strong>Email:</strong> ${user.email}<br>
                <strong>Phone:</strong> ${user.phone}
            </p>
            
            <h3>Part 1 Ranking (World View)</h3>
            <ol>
                ${part1Ranking.map(phrase => `<li>${phrase}</li>`).join('')}
            </ol>

            <h3>Part 2 Ranking (Self View)</h3>
            <ol>
                ${part2Ranking.map(phrase => `<li>${phrase}</li>`).join('')}
            </ol>
        </div>
    `;

    // --- Email to Mediator ---
    const mailToMediator = {
        from: '"Assessment App" <ronjsch@gmail.com>',
        to: mediatorEmail,
        subject: `New HVP Assessment Submission: ${user.name}`,
        html: resultsHtml // Use the 'html' property instead of 'text'
    };
     
    // --- Email to Participant ---
    const mailToParticipant = {
        from: '"Assessment App" <ronjsch@gmail.com>',
        to: user.email,
        subject: 'Your HVP Assessment Submission Confirmation',
        html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
                <p>Thank you for completing the assessment, ${user.name}.</p>
		<p>We will reach out to you to discuss the result in the next few days or else it will be discussed at your next coaching appointment. Remember to schedule at <a href="https://calendar.app.google/sZhYGQPUvM8tcqDR9">https://calendar.app.google/sZhYGQPUvM8tcqDR9</a>.</p>
		<hr>
                <p>Here is a copy of your results:</p>
            </div>
            ${resultsHtml}` // Use the 'html' property here as well
    };

    // Send both emails
    Promise.all([
        transporter.sendMail(mailToMediator),
        transporter.sendMail(mailToParticipant)
    ]).then(() => {
        console.log('Emails sent successfully');
        res.status(200).send({ message: 'Assessment submitted and emails sent.' });
    }).catch(error => {
        console.error('Error sending emails:', error);
        res.status(500).send({ message: 'Failed to send emails.' });
    });
});

// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});