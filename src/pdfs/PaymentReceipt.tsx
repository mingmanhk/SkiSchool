
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font that supports Chinese characters
// Note: In production, you need to provide a real path or URL to a font file like Noto Sans SC
Font.register({
  family: 'Noto Sans SC',
  src: 'https://fonts.gstatic.com/s/notosanssc/v12/k3kXo84MPvpLmixcA63OEALhLOCT-xWtmGW5.ttf'
});

const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 30, fontFamily: 'Noto Sans SC' },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 5 },
  label: { width: '30%', fontWeight: 'bold' },
  value: { width: '70%' }
});

interface ReceiptProps {
  lang: 'en' | 'zh';
  data: {
    receiptId: string;
    date: string;
    parentName: string;
    amount: string;
    items: { description: string; price: string }[];
  };
}

const translations = {
  en: {
    title: 'Payment Receipt',
    receiptId: 'Receipt ID',
    date: 'Date',
    parent: 'Parent',
    item: 'Item',
    price: 'Price',
    total: 'Total Paid',
    footer: 'Thank you for your business!'
  },
  zh: {
    title: '付款收据',
    receiptId: '收据编号',
    date: '日期',
    parent: '家长姓名',
    item: '项目',
    price: '价格',
    total: '支付总额',
    footer: '感谢您的惠顾！'
  }
};

export const PaymentReceiptPDF = ({ lang, data }: ReceiptProps) => {
  const t = translations[lang];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>{t.title}</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>{t.receiptId}:</Text>
            <Text style={styles.value}>{data.receiptId}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>{t.date}:</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t.parent}:</Text>
            <Text style={styles.value}>{data.parentName}</Text>
          </View>

          <View style={{ marginTop: 20 }}>
            {data.items.map((item, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{item.description}</Text>
                <Text style={styles.value}>{item.price}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20, borderTopWidth: 2, paddingTop: 10 }}>
             <View style={styles.row}>
                <Text style={styles.label}>{t.total}:</Text>
                <Text style={styles.value}>{data.amount}</Text>
             </View>
          </View>

          <Text style={{ marginTop: 50, textAlign: 'center', fontSize: 12, color: '#666' }}>
            {t.footer}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
