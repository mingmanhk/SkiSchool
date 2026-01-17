
import { createAdminClient } from '@/lib/supabase/server'
import RegistryTable from '@/components/registry/RegistryTable'
import PrintButton from '@/components/registry/PrintButton'
import { redirect } from 'next/navigation'

export default async function InstructorRegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const date = (await searchParams).date || new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase.rpc('get_class_registry', {
    p_date: date,
    p_instructor_id: user.id
  })

  if (error) {
    console.error('Error fetching registry:', error)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold">My Classes for {date}</h1>
        <PrintButton />
      </div>

      <div className="bg-white p-6 shadow-sm print:shadow-none print:p-0">
        <RegistryTable entries={data || []} />
      </div>
    </div>
  )
}
