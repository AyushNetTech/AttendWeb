'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect,useState } from 'react'

export default function Attendance() {
  const [rows,setRows]=useState([])

  useEffect(()=>{
    supabase.from('attendance')
      .select('*, employees(name,employee_code)')
      .then(({data})=>setRows(data))
  },[])

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Code</th><th>Type</th><th>Time</th><th>Photo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r=>(
          <tr key={r.id}>
            <td>{r.employees.name}</td>
            <td>{r.employees.employee_code}</td>
            <td>{r.punch_type}</td>
            <td>{new Date(r.punch_time).toLocaleString()}</td>
            <td><a href={r.photo_url} target="_blank">View</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
