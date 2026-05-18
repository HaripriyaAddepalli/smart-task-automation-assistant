import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string
) => {
  try {
    const EMAIL = process.env.EMAIL;
    const PASS = process.env.EMAIL_PASS;

    if (!EMAIL || !PASS) {
      throw new Error("Email credentials missing in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASS,
      },
    });

    const result = await transporter.sendMail({
      from: `"AI Task Assistant" <${EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent:", result.messageId);

    return "Email sent successfully";
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Email failed");
  }
};