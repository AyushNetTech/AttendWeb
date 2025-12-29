'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTheme, useMediaQuery } from '@mui/material'
import PhotoCameraOutlinedIcon from '@mui/icons-material/CameraAltTwoTone'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnTwoTone'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'


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
  location_text: string
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

const PAGE_SIZE = 15
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
  const [loading, setLoading] = useState(false)


  /* -------- FILTER STATE -------- */

  const [departments, setDepartments] = useState<string[]>([])
  const [designations, setDesignations] = useState<string[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)

  const theme = useTheme()
const isMobile = useMediaQuery(theme.breakpoints.down('xs'))
const isTablet = useMediaQuery(theme.breakpoints.down('md')) // <= 900px

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
    const defaultFrom = today
    const defaultTo = today

    setSelectedDepartments([])
    setSelectedDesignations([])
    setSelectedEmployees([])
    setFromDate(defaultFrom)
    setToDate(defaultTo)
    setPage(1)

    loadAttendance(1, {
      departments: [],
      designations: [],
      employees: [],
      fromDate: defaultFrom,
      toDate: defaultTo
    })
  }


  /* -------- LOAD ATTENDANCE -------- */

  async function loadAttendance(
      p = page,
      filters?: {
        departments?: string[]
        designations?: string[]
        employees?: number[]
        fromDate?: string
        toDate?: string
      }
    ) {

      const fDepartments = filters?.departments ?? selectedDepartments
      const fDesignations = filters?.designations ?? selectedDesignations
      const fEmployees = filters?.employees ?? selectedEmployees
      const fFromDate = filters?.fromDate ?? fromDate
      const fToDate = filters?.toDate ?? toDate


    setLoading(true)

    try{
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
      .select(`
        id,
        punch_type,
        punch_time,
        latitude,
        longitude,
        location_text,
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
      .gte('punch_time', `${fFromDate}T00:00:00`)
      .lte('punch_time', `${fToDate}T23:59:59`)

    if (fDepartments.length)
    query = query.in('employees.department', fDepartments)

    if (fDesignations.length)
      query = query.in('employees.designation', fDesignations)

    if (fEmployees.length)
      query = query.in('employees.id', fEmployees)

    const from = (p - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await query.returns<AttendanceRow[]>()
      .order('punch_time', { ascending: false })
      .range(from, to)

    setRows(Array.isArray(data) ? data : [])
    setTotal(count ?? 0)
    } finally{
      setLoading(false)
    }
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
    date: dayjs(r.punch_time).format('DD-MM-YY'),
    time: dayjs(r.punch_time).format('HH:mm'),
    location: r.location_text ?? '-',
    photo: r.photo_path,
    lat: r.latitude,
    lng: r.longitude
  }
})



  const columns: GridColDef[] = [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 100
      },
      {
        field: 'code',
        headerName: 'Code',
        flex: 0.2,
        minWidth: 60
      },
      {
        field: 'department',
        headerName: 'Department',
        flex: 1,
        minWidth: 100
      },
      {
        field: 'designation',
        headerName: 'Designation',
        flex: 1,
        minWidth: 120
      },
      {
        field: 'type',
        headerName: 'Type',
        flex: 0.5,
        minWidth: 50
      },
      {
        field: 'date',
        headerName: 'Date',
        flex: 0.5,
        minWidth: 80
      },
      {
        field: 'time',
        headerName: 'Time',
        flex: 0.5,
        minWidth: 80
      },
      {
        field: 'location',
        headerName: 'Location',
        flex: 1,
        minWidth: 80
      },
      {
        field: 'actions',
        headerName: 'Actions',
        minWidth: 120,
        sortable: false,
        renderCell: params => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="View Photo">
              <IconButton
                size="small"
                color="primary"
                onClick={() => openPhoto(params.row.photo)}
              >
                <PhotoCameraOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Location">
              <IconButton
                size="small"
                color="success"
                onClick={() => openMap(params.row.lat, params.row.lng)}
              >
                <LocationOnOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }

    ]




  /* -------- UI -------- */

  return (
    <div className="p-3 sm:p-6 h-[calc(100vh_-_120px)] w-screen md:w-screen sm:w-screen lg:w-full">
      <h1 className="text-2xl font-bold mb-3">Attendance</h1>
      <div className="h-full mr-2 lg:mr-0">
      {/* FILTER PANEL */}
      <Box
        sx={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          p: 1.5,
          mb: 1.5,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(6, 1fr)'
          },
          gap: 1,
          alignItems: 'center'
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

        {/* BUTTONS */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', height:"100%"}}>
          <Button size="small" variant="outlined" color="error" disabled={loading} onClick={clearFilters} style={{backgroundColor:"#FF5C5C", color:"white"}}>
            Clear
          </Button>
          <Button size="small" variant="contained" disabled={loading} onClick={applyFilters} style={{flex:1}}>
            {loading ? 'Applying…' : 'Apply'}
          </Button>
        </Box>
      </Box>

      {/* GRID */}
      <Box
        sx={{
          height: "100%",
          width: '100%',
          overflowX: 'auto',
          '& .MuiDataGrid-footerContainer': {
            minHeight: 52 // ⬅ force pagination visible
          },

          '& .MuiDataGrid-columnHeaders': {
            minHeight: 40,
            maxHeight: 40,
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: isTablet ? 12 : 14.5,
            fontWeight: 600,
            borderBottom: '1px solid #000000ff',
          },

          '& .MuiDataGrid-cell': {
            py: 0.4,
            fontSize: isTablet ? 12 : 13,
            whiteSpace: 'nowrap'
          }
        }}
      >


      <DataGrid
        rows={gridRows}
        columns={columns}
        loading={loading}
        rowCount={total}
        pageSizeOptions={[PAGE_SIZE]}
        paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
        onPaginationModelChange={m => {
          setPage(m.page + 1)
          loadAttendance(m.page + 1)
        }}
        sx={{
          overflowX: 'auto', 
        }}
        paginationMode="server"
        density="compact"
        disableRowSelectionOnClick
        disableColumnMenu
        scrollbarSize={8}
      />



      </Box>
      </div>
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
