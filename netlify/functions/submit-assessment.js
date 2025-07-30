const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // --- Email Configuration from Environment Variables on Netlify ---
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
    const MEDIATOR_EMAIL = process.env.MEDIATOR_EMAIL;
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS
        }
    });

    const data = JSON.parse(event.body);
    const { user, part1Ranking, part2Ranking } = data;

    const resultsHtml = `
      <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Assessment Results for: ${user.name}</h2>
          <p>
              <strong>Email:</strong> ${user.email}<br>
              <strong>Phone:</strong> ${user.phone}
          </p>
          <h3>Part 1 Ranking (World View)</h3>
          <ol>${part1Ranking.map(p => `<li>${p}</li>`).join('')}</ol>
          <h3>Part 2 Ranking (Self View)</h3>
          <ol>${part2Ranking.map(p => `<li>${p}</li>`).join('')}</ol>
      </div>
    `;

    const mailToMediator = {
        from: `"Assessment App" <${GMAIL_USER}>`,
        to: MEDIATOR_EMAIL,
        subject: `New HVP Assessment Submission: ${user.name}`,
        html: resultsHtml
    };
    
    const mailToParticipant = {
        from: `"Assessment App" <${GMAIL_USER}>`,
        to: user.email,
        subject: 'Your HVP Assessment Submission Confirmation',
        html: `
            <div style="font-family: sans-serif; line-height: 1.6;">
                <p>Thank you for completing the assessment, ${user.name}.</p>
                <p>We will reach out to you to discuss the result in the next few days or else it will be discussed at your next coaching appointment. Remember to schedule at <a href="https://calendar.app.google/sZhYGQPUvM8tcqDR9">https://calendar.app.google/sZhYGQPUvM8tcqDR9</a>.</p>
                <hr>
                <p>Here is a copy of your results:</p>
            </div>
            ${resultsHtml}`
    };

    try {
        await Promise.all([
            transporter.sendMail(mailToMediator),
            transporter.sendMail(mailToParticipant)
        ]);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Emails sent successfully!' })
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send emails.' })
        };
    }
};