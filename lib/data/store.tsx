"use client"

// Store global data dummy (PRD Bagian 13) — single source of truth semua modul.
// Persist ke localStorage agar state bertahan antar-refresh selama demo.
// Saat integrasi (M8+), fungsi-fungsi mutasi di sini diganti pemanggilan fetch() ke Flask/Supabase.

import * as React from "react"

import * as api from "@/lib/data/api"
import {
  seedActivities,
  seedDatasets,
  seedModels,
  seedPredictions,
  seedReports,
} from "@/lib/data/seed"
import type {
  Activity,
  ActivityKind,
  Dataset,
  Model,
  Prediction,
  Report,
  TrainingJob,
} from "@/lib/types"

interface AppState {
  datasets: Dataset[]
  models: Model[]
  predictions: Prediction[]
  reports: Report[]
  activities: Activity[]
  jobs: TrainingJob[]
}

const initialState: AppState = {
  datasets: seedDatasets,
  models: seedModels,
  predictions: seedPredictions,
  reports: seedReports,
  activities: seedActivities,
  jobs: [],
}

const STORAGE_KEY = "klasifikasi-subsidi-store-v1"

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "syncFromApi"; datasets?: Dataset[]; models?: Model[] }
  | { type: "addDataset"; dataset: Dataset }
  | { type: "deleteDataset"; id: string }
  | { type: "setDatasetStatus"; id: string; status: Dataset["status"] }
  | { type: "addJob"; job: TrainingJob }
  | { type: "finishJob"; jobId: string; model: Model }
  | { type: "setActiveModel"; id: string }
  | { type: "addPrediction"; prediction: Prediction }
  | { type: "addReport"; report: Report }
  | { type: "addActivity"; activity: Activity }
  | { type: "reset" }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state
    case "syncFromApi": {
      // Model = sumber kebenaran dari API (jika ada). Dataset di-upsert: pertahankan baris
      // preview & dataset lokal (hasil upload) yang belum dikenal API.
      let datasets = state.datasets
      if (action.datasets) {
        const byId = new Map(datasets.map((d) => [d.id, d]))
        for (const d of action.datasets) {
          const existing = byId.get(d.id)
          byId.set(d.id, existing ? { ...existing, ...d, rows: existing.rows } : d)
        }
        datasets = Array.from(byId.values())
      }
      return {
        ...state,
        datasets,
        models: action.models && action.models.length > 0 ? action.models : state.models,
      }
    }
    case "addDataset":
      return { ...state, datasets: [action.dataset, ...state.datasets] }
    case "deleteDataset":
      return { ...state, datasets: state.datasets.filter((d) => d.id !== action.id) }
    case "setDatasetStatus":
      return {
        ...state,
        datasets: state.datasets.map((d) =>
          d.id === action.id ? { ...d, status: action.status } : d
        ),
      }
    case "addJob":
      return { ...state, jobs: [action.job, ...state.jobs] }
    case "finishJob":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId ? { ...j, model_id: action.model.id } : j
        ),
        models: state.models.some((m) => m.id === action.model.id)
          ? state.models
          : [action.model, ...state.models],
      }
    case "setActiveModel":
      return {
        ...state,
        models: state.models.map((m) => ({ ...m, is_active: m.id === action.id })),
      }
    case "addPrediction":
      return { ...state, predictions: [action.prediction, ...state.predictions] }
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
  /** null = belum dicoba, true = API model terjangkau, false = offline (pakai data lokal). */
  apiOnline: boolean | null
  dispatch: React.Dispatch<Action>
  addActivity: (jenis: ActivityKind, deskripsi: string) => void
  /** Ambil ulang datasets & models dari API dan sinkronkan ke store (best-effort). */
  syncFromApi: () => Promise<void>
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
  const [apiOnline, setApiOnline] = React.useState<boolean | null>(null)

  const syncFromApi = React.useCallback(async () => {
    try {
      const [apiDatasets, apiModels] = await Promise.all([
        api.getDatasets(),
        api.getModels(),
      ])
      // ApiDataset → Dataset (rows preview diisi oleh store lewat upsert bila sudah ada lokal).
      const datasets: Dataset[] = apiDatasets.map((d) => ({
        id: d.id,
        nama_file: d.nama_file,
        jumlah_baris: d.jumlah_baris,
        jumlah_kolom: d.jumlah_kolom,
        status: d.status,
        uploaded_at: new Date().toISOString(),
        rows: [],
      }))
      dispatch({ type: "syncFromApi", datasets, models: apiModels })
      setApiOnline(true)
    } catch {
      // API tidak terjangkau → tetap pakai seed lokal (demo offline tetap jalan).
      setApiOnline(false)
    }
  }, [])

  React.useEffect(() => {
    // Sinkronisasi satu kali dari sistem eksternal (localStorage) saat mount —
    // setState di sini memang diperlukan agar render server = render klien pertama.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppState
        if (parsed && Array.isArray(parsed.datasets)) {
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

  // Setelah hydrate, sinkronkan datasets & models dari API model (best-effort, sekali).
  // setState di dalam syncFromApi terjadi setelah await (asinkron), bukan render bertingkat.
  React.useEffect(() => {
    if (!hydrated) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void syncFromApi()
  }, [hydrated, syncFromApi])

  const addActivity = React.useCallback((jenis: ActivityKind, deskripsi: string) => {
    dispatch({
      type: "addActivity",
      activity: {
        id: generateId("act"),
        jenis,
        deskripsi,
        created_at: new Date().toISOString(),
      },
    })
  }, [])

  const value = React.useMemo(
    () => ({ state, hydrated, apiOnline, dispatch, addActivity, syncFromApi }),
    [state, hydrated, apiOnline, addActivity, syncFromApi]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore harus dipakai di dalam <StoreProvider>")
  return ctx
}

// ---- Selector kecil agar halaman tidak menghitung ulang sendiri ----

export function useActiveModel() {
  const { state } = useStore()
  return state.models.find((m) => m.is_active) ?? null
}
