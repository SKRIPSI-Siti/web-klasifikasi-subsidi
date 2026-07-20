"use client"

// Store global data dummy (PRD Bagian 13) — single source of truth semua modul.
// Persist ke localStorage agar state bertahan antar-refresh selama demo.
// Saat integrasi (M8+), fungsi-fungsi mutasi di sini diganti pemanggilan fetch() ke Flask/Supabase.

import * as React from "react"

import { seedActivities, seedPredictions, seedReports } from "@/lib/data/seed"
import type { Activity, ActivityKind, Prediction, Report } from "@/lib/types"

interface AppState {
  predictions: Prediction[]
  reports: Report[]
  activities: Activity[]
}

const initialState: AppState = {
  predictions: seedPredictions,
  reports: seedReports,
  activities: seedActivities,
}

const STORAGE_KEY = "klasifikasi-subsidi-store-v1"

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "addPrediction"; prediction: Prediction }
  | { type: "addReport"; report: Report }
  | { type: "addActivity"; activity: Activity }
  | { type: "reset" }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state
    case "addPrediction":
      return {
        ...state,
        predictions: [action.prediction, ...state.predictions],
      }
    case "addReport":
      return {
        ...state,
        reports: [action.report, ...state.reports],
        predictions: state.predictions.map((p) =>
          p.id === action.report.prediction_id
            ? { ...p, saved_report_id: action.report.id }
            : p
        ),
      }
    case "addActivity":
      return { ...state, activities: [action.activity, ...state.activities] }
    case "reset":
      return initialState
    default:
      return state
  }
}

interface StoreContextValue {
  state: AppState
  hydrated: boolean
  dispatch: React.Dispatch<Action>
  addActivity: (jenis: ActivityKind, deskripsi: string) => void
}

const StoreContext = React.createContext<StoreContextValue | null>(null)

let idCounter = 0
export function generateId(prefix: string) {
  idCounter += 1
  return `${prefix}_${Date.now().toString(36)}${idCounter}`
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    // Sinkronisasi satu kali dari sistem eksternal (localStorage) saat mount —
    // setState di sini memang diperlukan agar render server = render klien pertama.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppState
        if (parsed && Array.isArray(parsed.predictions)) {
          dispatch({ type: "hydrate", state: { ...initialState, ...parsed } })
        }
      }
    } catch {
      // localStorage rusak → pakai seed
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // kuota penuh — abaikan, demo tetap jalan tanpa persist
    }
  }, [state, hydrated])

  const addActivity = React.useCallback(
    (jenis: ActivityKind, deskripsi: string) => {
      dispatch({
        type: "addActivity",
        activity: {
          id: generateId("act"),
          jenis,
          deskripsi,
          created_at: new Date().toISOString(),
        },
      })
    },
    []
  )

  const value = React.useMemo(
    () => ({ state, hydrated, dispatch, addActivity }),
    [state, hydrated, addActivity]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore harus dipakai di dalam <StoreProvider>")
  return ctx
}
