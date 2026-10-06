const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: `"ChopGo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your ChopGo password",

    text: `You requested a password reset for your ChopGo account.

Click the link below to reset your password:

${resetLink}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background: #fff7f4;
        padding: 40px 20px;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
        ">

          <h1 style="
            color: #c90016;
            margin-bottom: 8px;
          ">
            ChopGo
          </h1>

          <h2 style="color: #222222;">
            Reset your password
          </h2>

          <p style="
            color: #555555;
            line-height: 1.6;
          ">
            We received a request to reset your ChopGo
            account password.
          </p>

          <p style="
            color: #555555;
            line-height: 1.6;
          ">
            Click the button below to create a new password.
          </p>

          <a
            href="${resetLink}"
            style="
              display: inline-block;
              background: #c90016;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 24px;
              border-radius: 999px;
              font-weight: bold;
              margin: 16px 0;
            "
          >
            Reset Password
          </a>

          <p style="
            color: #777777;
            font-size: 14px;
            line-height: 1.6;
          ">
            This password reset link will expire in 15 minutes.
          </p>

          <p style="
            color: #777777;
            font-size: 14px;
            line-height: 1.6;
          ">
            If you did not request this, you can safely ignore this email.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #eeeeee;
            margin: 24px 0;
          ">

          <p style="
            color: #999999;
            font-size: 12px;
          ">
            ChopGo — Good Food. Delivered.
          </p>

        </div>
      </div>
    `,
  });
};

const sendEmailVerificationCode = async (email, code) => {
  await transporter.sendMail({
    from: `"ChopGo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your ChopGo email",

    text: `Welcome to ChopGo!

Your email verification code is:

${code}

This code will expire in 10 minutes.

If you did not create a ChopGo account, you can safely ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background: #fff7f4;
        padding: 40px 20px;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
        ">

          <h1 style="
            color: #c90016;
            margin-bottom: 8px;
          ">
            ChopGo
          </h1>

          <h2 style="color: #222222;">
            Verify your email
          </h2>

          <p style="
            color: #555555;
            line-height: 1.6;
          ">
            Welcome to ChopGo! Use the verification code below
            to verify your email address.
          </p>

          <div style="
            background: #fff1ed;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            margin: 24px 0;
          ">
            <div style="
              color: #c90016;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
            ">
              ${code}
            </div>
          </div>

          <p style="
            color: #777777;
            font-size: 14px;
            line-height: 1.6;
          ">
            This verification code will expire in 10 minutes.
          </p>

          <p style="
            color: #777777;
            font-size: 14px;
            line-height: 1.6;
          ">
            If you did not create a ChopGo account, you can
            safely ignore this email.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #eeeeee;
            margin: 24px 0;
          ">

          <p style="
            color: #999999;
            font-size: 12px;
          ">
            ChopGo — Good Food. Delivered.
          </p>

        </div>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerificationCode,
};