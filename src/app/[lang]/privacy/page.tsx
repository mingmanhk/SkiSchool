
import { getDictionary } from '@/i18n/server'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isZh = lang === 'zh'
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar lang={lang} />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {isZh ? '隐私政策' : 'Privacy Policy'}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none bg-white p-8 rounded shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 mb-6">
            {isZh ? '最后更新：2024年1月1日' : 'Last Updated: January 1, 2024'}
          </p>

          <h3>{isZh ? '1. 数据收集' : '1. Data Collection'}</h3>
          <p>
            {isZh 
              ? '我们收集您直接提供的信息，例如姓名、联系方式、出生日期和支付信息，以便处理报名和提供服务。' 
              : 'We collect information you provide directly, such as names, contact details, birthdates, and payment info, to process enrollments and deliver services.'}
          </p>

          <h3>{isZh ? '2. 数据使用' : '2. Data Usage'}</h3>
          <p>
            {isZh
              ? '您的数据仅用于管理课程、处理付款和发送必要的通知（如课程变更或紧急情况）。我们不会将您的个人数据出售给第三方。'
              : 'Your data is used solely to manage classes, process payments, and send necessary notifications (e.g., class changes or emergencies). We do not sell your personal data to third parties.'}
          </p>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  )
}
