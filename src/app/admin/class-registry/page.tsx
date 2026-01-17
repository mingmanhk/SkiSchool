
import { createAdminClient } from '@/lib/supabase/server'
import RegistryFilter from '@/components/registry/RegistryFilter'
import RegistryTable from '@/components/registry/RegistryTable'

export default async function AdminRegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; programId?: string; instructorId?: string }>
}) {
  const params = await searchParams
  const supabase = await createAdminClient()
  
  // Default to today if no date selected
  const date = params.date || new Date().toISOString().split('T')[0]
  const programId = params.programId || null
  const instructorId = params.instructorId || null

  let registryData: any[] = []
  
  // Call the RPC function
  const { data, error } = await supabase.rpc('get_class_registry', {
    p_date: date,
    p_program_id: programId,
    p_instructor_id: instructorId
  })

  if (error) {
    console.error('Error fetching registry:', error)
  } else {
    registryData = data || []
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8 print:hidden">
        <h1 className="text-3xl font-bold mb-4">Class Registry</h1>
        <p className="text-gray-600 mb-6">Generate printable daily class lists.</p>
        
        {/* Filter disabled temporarily due to build error */}
        {/* <FilterWrapper /> */} 
      </div>

      <div className="bg-white p-8 shadow-sm print:shadow-none print:p-0 min-h-screen">
        <RegistryTable entries={registryData} />
      </div>
    </div>
  )
}

/*
// Client wrapper to handle navigation on filter change
import { redirect } from 'next/navigation'

function FilterWrapper() {
  return (
      <ClientFilter />
  )
}

'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function ClientFilter() {
    const router = useRouter()
    
    return (
        <RegistryFilter onGenerate={(filters: any) => {
            const params = new URLSearchParams()
            if (filters.date) params.set('date', filters.date)
            if (filters.programId) params.set('programId', filters.programId)
            if (filters.instructorId) params.set('instructorId', filters.instructorId)
            
            router.push(`?${params.toString()}`)
        }} />
    )
}
*/
