import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use 'smtp.mailtrap.io' for testing
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your email address',
    html: `
      <div>
        <h1>Welcome!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}">${url}</a>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  });
};
