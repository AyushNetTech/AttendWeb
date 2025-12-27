'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField
} from '@mui/material'
import dayjs from 'dayjs'

/* ---------------- TYPES ---------------- */

type AttendanceRow = {
  id: number
  punch_type: 'IN' | 'OUT'
  punch_time: string
  latitude: number
  longitude: number
  photo_path: string
  employees: {
    id: number
    name: string | null
    employee_code: string | null
    department: string | null
    designation: string | null
  }| null
}


type EmployeeOption = {
  id: number
  name: string
  code: string
  department: string
  designation: string
}

const PAGE_SIZE = 50
const today = dayjs().format('YYYY-MM-DD')

type LocationCache = {
  [key: string]: string
}


/* ---------------- COMPONENT ---------------- */

export default function Attendance() {
  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [locationCache, setLocationCache] = useState<LocationCache>({})


  /* -------- FILTER STATE -------- */

  const [departments, setDepartments] = useState<string[]>([])
  const [designations, setDesignations] = useState<string[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)

  /* -------- INITIAL LOAD -------- */

  useEffect(() => {
    loadFilterOptions()
    applyFilters()
  }, [])

  /* -------- LOAD FILTER OPTIONS -------- */

  async function loadFilterOptions() {
    const { data } = await supabase
      .from('employees')
      .select('id, name, employee_code, department, designation')

    if (!data) return

    setEmployees(
      data.map(e => ({
        id: e.id,
        name: e.name ?? '',
        code: e.employee_code ?? '',
        department: e.department ?? '',
        designation: e.designation ?? ''
      }))
    )

    setDepartments(
      Array.from(new Set(data.map(e => e.department).filter(Boolean)))
    )
  }

  /* -------- DEPENDENT FILTERS -------- */

  useEffect(() => {
    const filtered = employees.filter(e =>
      selectedDepartments.includes(e.department)
    )

    setDesignations(
      Array.from(new Set(filtered.map(e => e.designation)))
    )

    setSelectedDesignations([])
    setSelectedEmployees([])
  }, [selectedDepartments])

  useEffect(() => {
    setSelectedEmployees([])
  }, [selectedDesignations])
  

  /* -------- APPLY FILTERS -------- */

  async function applyFilters() {
    setPage(1)
    await loadAttendance(1)
  }

  /* -------- CLEAR FILTERS -------- */

  function clearFilters() {
    setSelectedDepartments([])
    setSelectedDesignations([])
    setSelectedEmployees([])
    setFromDate(today)
    setToDate(today)
    loadAttendance(1)
  }

  /* -------- LOAD ATTENDANCE -------- */

  async function loadAttendance(p = page) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) return

    let query = supabase
      .from('attendance')
      .select(
        `
        id,
        punch_type,
        punch_time,
        latitude,
        longitude,
        photo_path,
        employees!inner (
          id,
          name,
          employee_code,
          department,
          designation
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', company.id)
      .gte('punch_time', `${fromDate}T00:00:00`)
      .lte('punch_time', `${toDate}T23:59:59`)

    if (selectedDepartments.length)
      query = query.in('employees.department', selectedDepartments)

    if (selectedDesignations.length)
      query = query.in('employees.designation', selectedDesignations)

    if (selectedEmployees.length)
      query = query.in('employees.id', selectedEmployees)

    const from = (p - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await query.returns<AttendanceRow[]>()
      .order('punch_time', { ascending: false })
      .range(from, to)

    setRows(Array.isArray(data) ? data : [])
    setTotal(count ?? 0)
  }

  /* -------- ACTION HELPERS -------- */

  const openMap = (lat: number, lng: number) => {
    window.open(
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`,
      '_blank'
    )
  }

  const openPhoto = (path: string) => {
    const url = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(path).data.publicUrl
    window.open(url, '_blank')
  }

  async function resolveLocation(lat: number, lng: number) {
  const key = `${lat},${lng}`

  if (locationCache[key]) return locationCache[key]

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    )
    const json = await res.json()

    const place =
      json.address?.city ||
      json.address?.town ||
      json.address?.village ||
      json.address?.county ||
      'Unknown location'

    setLocationCache(prev => ({ ...prev, [key]: place }))
    return place
  } catch {
    return 'Unknown location'
  }
}

useEffect(() => {
  rows.forEach(r => {
    const key = `${r.latitude},${r.longitude}`
    if (!locationCache[key]) {
      resolveLocation(r.latitude, r.longitude)
    }
  })
}, [rows])


  /* -------- GRID DATA -------- */

  const gridRows = rows.map(r => {
  const emp = r.employees
  const key = `${r.latitude},${r.longitude}`

  return {
    id: r.id,
    name: emp?.name ?? '-',
    code: emp?.employee_code ?? '-',
    department: emp?.department ?? '-',
    designation: emp?.designation ?? '-',
    type: r.punch_type,
    time: dayjs(r.punch_time).format('DD MMM YYYY, hh:mm A'),
    location: locationCache[key] ?? '-',
    photo: r.photo_path,
    lat: r.latitude,
    lng: r.longitude
  }
})



  const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'code', headerName: 'Code', width: 120 },
  { field: 'department', headerName: 'Department', width: 160 },
  { field: 'designation', headerName: 'Designation', width: 160 },
  { field: 'type', headerName: 'Type', width: 100 },
  { field: 'time', headerName: 'Time', width: 200 },

  {
    field: 'location',
    headerName: 'Location',
    width: 180
  },

  {
  field: 'actions',
  headerName: 'Actions',
  width: 180,
  sortable: false,
  renderCell: params => (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        alignItems:"center",
        width: '100%',
        height:"100%"
      }}
    >
      <Button
        size="small"
        variant="contained"
        onClick={() => openPhoto(params.row.photo)}
      >
        Photo
      </Button>
      <Button
        size="small"
        color="success"
        variant="contained"
        onClick={() => openMap(params.row.lat, params.row.lng)}
      >
        Map
      </Button>
    </Box>
  )
}

]


  /* -------- UI -------- */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Attendance</h1>

      {/* FILTER PANEL */}
      <Box
  sx={{
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 2,
    p: 2,
    mb:2,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(5, 1fr)'
    },
    gap: 0.8,
  }}
>
  <MultiSelect
    label="Department"
    options={departments}
    value={selectedDepartments}
    onChange={setSelectedDepartments}
    size="small"
  />

  <MultiSelect
    label="Designation"
    options={designations}
    value={selectedDesignations}
    onChange={setSelectedDesignations}
    disabled={!selectedDepartments.length}
    size="small"
  />

  <MultiSelect
    label="Employee"
    options={employees
      .filter(e =>
        (!selectedDepartments.length || selectedDepartments.includes(e.department)) &&
        (!selectedDesignations.length || selectedDesignations.includes(e.designation))
      )
      .map(e => ({
        value: e.id,
        label: `${e.name} (${e.code})`
      }))}
    value={selectedEmployees}
    onChange={setSelectedEmployees}
    disabled={!selectedDesignations.length}
    size="small"
  />

  <TextField
    size="small"
    type="date"
    label="From"
    value={fromDate}
    onChange={e => setFromDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
  />

  <TextField
    size="small"
    type="date"
    label="To"
    value={toDate}
    onChange={e => setToDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
  />

  <Box
    sx={{
      gridColumn: '1 / -1',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
      mt: 0.5,
    }}
  >
    <Button size="small" variant="outlined" color="error" onClick={clearFilters}>
      Clear
    </Button>
    <Button size="small" variant="contained" onClick={applyFilters}>
      Apply Filter
    </Button>
  </Box>
</Box>


      {/* GRID */}
      <Box
        sx={{
          height: { xs: 420, md: 520 },
          width: '100%',
          '& .MuiDataGrid-columnHeaders': {
            minHeight: 40,
            maxHeight: 40,
            fontWeight:"bold", fontSize: 15,
            background:"black"
          },
          '& .MuiDataGrid-cell': {
            py: 0.5,
            fontSize: 14
          }
        }}
      >
        <DataGrid
          rows={gridRows}
          columns={columns}
          rowCount={total}
          pageSizeOptions={[PAGE_SIZE]}
          paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
          onPaginationModelChange={m => {
            setPage(m.page + 1)
            loadAttendance(m.page + 1)
          }}
          paginationMode="server"
          density="compact"
          disableRowSelectionOnClick
        />

      </Box>
    </div>
  )
}

/* ---------------- MULTI SELECT ---------------- */

function MultiSelect({
  label,
  options,
  value,
  onChange,
  disabled,
  size = 'small'
}: any) {
  return (
    <FormControl fullWidth size={size} disabled={disabled}>
      <InputLabel size={size}>{label}</InputLabel>
      <Select
        multiple
        size={size}
        value={value}
        onChange={e => onChange(e.target.value)}
        input={<OutlinedInput label={label} />}
        renderValue={(selected: any[]) => `${selected.length} selected`}
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 240 }
          }
        }}
      >
        {options.map((opt: any) => {
          const val = opt.value ?? opt
          const text = opt.label ?? opt
          return (
            <MenuItem key={val} value={val} dense>
              <Checkbox size="small" checked={value.includes(val)} />
              <ListItemText
                primary={text}
                primaryTypographyProps={{ fontSize: 13 }}
              />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}
