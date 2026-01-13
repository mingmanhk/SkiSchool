
interface EmailData {
  subject: { en: string; zh: string };
  body: { en: string; zh: string };
}

export const emailTemplates = {
  enrollmentConfirmation: (data: { parentName: string; studentName: string; className: string }): EmailData => ({
    subject: {
      en: "Enrollment Confirmation - Ski School OS",
      zh: "报名确认 - Ski School OS"
    },
    body: {
      en: `
        <h1>Hello ${data.parentName},</h1>
        <p>Thank you for enrolling <strong>${data.studentName}</strong> in <strong>${data.className}</strong>.</p>
        <p>We look forward to seeing you on the slopes!</p>
        <p>Best regards,<br>The Ski School Team</p>
      `,
      zh: `
        <h1>您好 ${data.parentName},</h1>
        <p>感谢您为 <strong>${data.studentName}</strong> 报名参加 <strong>${data.className}</strong>。</p>
        <p>期待在雪场见到您！</p>
        <p>此致，<br>滑雪学校团队</p>
      `
    }
  }),
  paymentReceipt: (data: { amount: string; date: string }): EmailData => ({
    subject: {
      en: "Payment Receipt",
      zh: "支付收据"
    },
    body: {
      en: `
        <h1>Payment Successful</h1>
        <p>We have received your payment of <strong>${data.amount}</strong> on ${data.date}.</p>
      `,
      zh: `
        <h1>支付成功</h1>
        <p>我们已于 ${data.date} 收到您的付款 <strong>${data.amount}</strong>。</p>
      `
    }
  })
};
