
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font that supports Chinese characters
// In a real app, you need to download a font file like 'NotoSansSC-Regular.ttf'
// and place it in your public folder or import it.
// Font.register({
//   family: 'NotoSansSC',
//   src: '/fonts/NotoSansSC-Regular.ttf'
// });

const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 30, fontFamily: 'Helvetica' }, // Fallback font
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { margin: 10, padding: 10 },
  text: { fontSize: 12, marginBottom: 5 },
  label: { fontSize: 10, color: 'grey' },
  chineseText: { fontFamily: 'Helvetica' } // Should be NotoSansSC
});

interface EnrollmentData {
  parentName: string;
  studentName: string;
  programName: string;
  className: string;
  amount: string;
  date: string;
}

export const EnrollmentConfirmationPDF = ({ data, lang }: { data: EnrollmentData, lang: 'en' | 'zh' }) => {
  const t = {
    en: {
      title: 'Enrollment Confirmation',
      student: 'Student Name',
      program: 'Program',
      class: 'Class',
      amount: 'Amount Paid',
      date: 'Date',
      footer: 'Thank you for choosing Ski School OS!'
    },
    zh: {
      title: '报名确认单',
      student: '学员姓名',
      program: '课程项目',
      class: '班级',
      amount: '支付金额',
      date: '日期',
      footer: '感谢您选择 Ski School OS！'
    }
  }[lang];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{t.title}</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>{t.student}</Text>
            <Text style={styles.text}>{data.studentName}</Text>
            
            <Text style={styles.label}>{t.program}</Text>
            <Text style={styles.text}>{data.programName}</Text>
            
            <Text style={styles.label}>{t.class}</Text>
            <Text style={styles.text}>{data.className}</Text>
            
            <Text style={styles.label}>{t.amount}</Text>
            <Text style={styles.text}>{data.amount}</Text>
            
            <Text style={styles.label}>{t.date}</Text>
            <Text style={styles.text}>{data.date}</Text>
          </View>

          <Text style={{ ...styles.text, marginTop: 50, textAlign: 'center' }}>
            {t.footer}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
