import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Use same env config approach as server.js
dotenv.config({ path: '../.env' });
if (!process.env.EMAIL_USER) dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Base wrapper for the HTML Email to keep styling consistent
 */
const wrapHtmlEmail = (title, content) => `
  <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #141414; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
    <div style="background-color: #ffc105; padding: 20px; text-align: center;">
      <h1 style="color: #111111; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -1px;">
        CJ<span style="color: #ffffff; margin-left: 4px;">FITNESS</span>
      </h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #ffc105; margin-top: 0; font-size: 20px;">${title}</h2>
      <div style="line-height: 1.6; color: #dddddd; font-size: 16px;">
        ${content}
      </div>
    </div>
    <div style="padding: 20px; text-align: center; border-top: 1px solid #333; background-color: #1a1a1a; font-size: 12px; color: #888888;">
      This is an automated message from CJ Fitness. Please do not reply to this email.
      <br/><br/>
      <a href="https://cj-fitness-app.vercel.app/" style="color: #ffc105; text-decoration: none; font-weight: bold;">Open Client Portal</a>
    </div>
  </div>
`;

/**
 * Sends a custom Reminder (Alarm) email
 */
export const sendReminderEmail = async (clientEmail, clientName, description) => {
  if (!clientEmail) return;
  
  const htmlContent = wrapHtmlEmail(
    'You have a new Alarm!',
    `<p>Hi ${clientName},</p>
     <p>Coach CJ just set a new custom reminder for you:</p>
     <div style="background-color: #222; padding: 15px; border-left: 4px solid #ffc105; margin: 20px 0; font-weight: 500; font-size: 18px;">
       "OS_ALARM_TEXT"
     </div>
     <p>Don't forget to mark it as read in your dashboard!</p>`
     .replace('OS_ALARM_TEXT', description)
  );

  try {
    await transporter.sendMail({
      from: `"CJ Fitness" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: "🚨 New Reminder - CJ Fitness",
      html: htmlContent,
    });
    console.log(`Email sent to ${clientEmail} for reminder.`);
  } catch (error) {
    console.error(`Failed to send reminder email to ${clientEmail}:`, error.message);
  }
};

/**
 * Sends the Monday Weekly Check-in reminder email
 */
export const sendMondayCheckinEmail = async (clientEmail, clientName) => {
  if (!clientEmail) return;

  const htmlContent = wrapHtmlEmail(
    'Happy Monday!',
    `<p>Good morning ${clientName}!</p>
     <p>It's time for your weekly check-in. Tracking your progress is the best way to ensure you hit your goals this week.</p>
     <p>Please log in to your portal and submit your updated measurements, weight, and photos.</p>
     <div style="text-align: center; margin: 30px 0;">
       <a href="https://cj-fitness-app.vercel.app/client/check-ins" style="background-color: #ffc105; color: #111; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
         Submit Check-in
       </a>
     </div>
     <p>Let's crush this week!</p>
     <p>- Coach CJ</p>`
  );

  try {
    await transporter.sendMail({
      from: `"CJ Fitness" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: "✅ Action Required: Weekly Check-in",
      html: htmlContent,
    });
    console.log(`Check-in email sent to ${clientEmail}.`);
  } catch (error) {
    console.error(`Failed to send checkin email to ${clientEmail}:`, error.message);
  }
};
