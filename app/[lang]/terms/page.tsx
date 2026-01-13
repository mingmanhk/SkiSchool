
import { getDictionary } from '@/src/i18n/server'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default async function TermsPage({ params }: { params: { lang: string } }) {
  const isZh = params.lang === 'zh'
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar lang={params.lang} />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          {isZh ? '服务条款' : 'Terms and Conditions'}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none bg-white p-8 rounded shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 mb-6">
            {isZh ? '最后更新：2024年1月1日' : 'Last Updated: January 1, 2024'}
          </p>

          <h3>{isZh ? '1. 简介' : '1. Introduction'}</h3>
          <p>
            {isZh 
              ? '欢迎使用 Ski School OS。访问我们的网站并使用我们的服务，即表示您同意受这些条款和条件的约束。' 
              : 'Welcome to Ski School OS. By accessing our website and using our services, you agree to be bound by these Terms and Conditions.'}
          </p>

          <h3>{isZh ? '2. 免责声明' : '2. Liability Waiver'}</h3>
          <p>
            {isZh
              ? '滑雪和单板滑雪涉及固有风险。通过报名参加课程，您承认这些风险并同意免除 Ski School OS 及其员工的任何伤害责任。'
              : 'Skiing and snowboarding involve inherent risks. By enrolling in classes, you acknowledge these risks and agree to release Ski School OS and its employees from liability for any injuries.'}
          </p>

          <h3>{isZh ? '3. 退款政策' : '3. Refund Policy'}</h3>
          <p>
            {isZh
              ? '课程开始前48小时取消可全额退款。少于48小时通知将不予退款，但在医疗紧急情况下可能会发放积分。'
              : 'Cancellations made 48 hours prior to the lesson start time are eligible for a full refund. Less than 48 hours notice will result in no refund, though credit may be issued in medical emergencies.'}
          </p>
        </div>
      </main>
      <Footer lang={params.lang} />
    </div>
  )
}
