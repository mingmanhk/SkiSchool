
interface EmailTemplateProps {
  lang: 'en' | 'zh';
  name: string;
  courseName: string;
  startDate: string;
}

const translations = {
  en: {
    subject: 'Enrollment Confirmation',
    greeting: 'Hello',
    body1: 'You have successfully enrolled in',
    body2: 'starting on',
    footer: 'See you on the slopes!'
  },
  zh: {
    subject: '报名确认',
    greeting: '你好',
    body1: '您已成功报名',
    body2: '开始日期为',
    footer: '雪场见！'
  }
};

export const getEnrollmentEmail = ({ lang, name, courseName, startDate }: EmailTemplateProps) => {
  const t = translations[lang];
  
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>${t.subject}</h2>
        <p>${t.greeting} ${name},</p>
        <p>${t.body1} <strong>${courseName}</strong> ${t.body2} ${startDate}.</p>
        <hr />
        <p>${t.footer}</p>
      </body>
    </html>
  `;
};

export const getEnrollmentSubject = (lang: 'en' | 'zh') => translations[lang].subject;
