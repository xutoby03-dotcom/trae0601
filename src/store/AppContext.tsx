import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Trip, Expense, ExpenseCategory, ExpenseStatus, SharedFundContribution } from '../types'
import type { Participant } from '../types'
import { PARTICIPANT_COLORS } from '../types'

interface AppState {
  trips: Trip[]
}

type Action =
  | { type: 'ADD_TRIP'; payload: { destination: string; startDate: string; endDate: string; participantNames: string[]; budget: number } }
  | { type: 'DELETE_TRIP'; payload: { tripId: string } }
  | { type: 'ADD_EXPENSE'; payload: { tripId: string } & Omit<Expense, 'id' | 'tripId'> }
  | { type: 'UPDATE_EXPENSE'; payload: { tripId: string; expenseId: string } & Partial<Omit<Expense, 'id' | 'tripId'>> }
  | { type: 'DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } }
  | { type: 'SET_EXPENSE_STATUS'; payload: { tripId: string; expenseId: string; status: ExpenseStatus } }
  | { type: 'ADD_PARTICIPANT'; payload: { tripId: string; name: string } }
  | { type: 'REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string; leftDate: string } }
  | { type: 'ADD_SHARED_FUND_CONTRIBUTION'; payload: { tripId: string } & Omit<SharedFundContribution, 'id'> }
  | { type: 'LOAD_STATE'; payload: AppState }

function createParticipant(name: string, index: number): Participant {
  return {
    id: uuidv4(),
    name,
    color: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length],
    isActive: true,
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRIP': {
      const participants = action.payload.participantNames.map((name, i) => createParticipant(name, i))
      const trip: Trip = {
        id: uuidv4(),
        destination: action.payload.destination,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
        participants,
        budget: action.payload.budget,
        expenses: [],
        sharedFund: [],
        createdAt: new Date().toISOString(),
      }
      return { ...state, trips: [trip, ...state.trips] }
    }

    case 'DELETE_TRIP':
      return { ...state, trips: state.trips.filter(t => t.id !== action.payload.tripId) }

    case 'ADD_EXPENSE': {
      const { tripId, ...expenseData } = action.payload
      const expense: Expense = { id: uuidv4(), tripId, ...expenseData }
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === tripId ? { ...t, expenses: [...t.expenses, expense] } : t
        ),
      }
    }

    case 'UPDATE_EXPENSE': {
      const { tripId, expenseId, ...updates } = action.payload
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === tripId
            ? {
                ...t,
                expenses: t.expenses.map(e =>
                  e.id === expenseId ? { ...e, ...updates } : e
                ),
              }
            : t
        ),
      }
    }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? { ...t, expenses: t.expenses.filter(e => e.id !== action.payload.expenseId) }
            : t
        ),
      }

    case 'SET_EXPENSE_STATUS': {
      const { tripId, expenseId, status } = action.payload
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === tripId
            ? {
                ...t,
                expenses: t.expenses.map(e =>
                  e.id === expenseId ? { ...e, status } : e
                ),
              }
            : t
        ),
      }
    }

    case 'ADD_PARTICIPANT': {
      const { tripId, name } = action.payload
      return {
        ...state,
        trips: state.trips.map(t => {
          if (t.id !== tripId) return t
          const newParticipant = createParticipant(name, t.participants.length)
          return { ...t, participants: [...t.participants, newParticipant] }
        }),
      }
    }

    case 'REMOVE_PARTICIPANT': {
      const { tripId, participantId, leftDate } = action.payload
      return {
        ...state,
        trips: state.trips.map(t => {
          if (t.id !== tripId) return t
          return {
            ...t,
            participants: t.participants.map(p =>
              p.id === participantId ? { ...p, isActive: false, leftDate } : p
            ),
          }
        }),
      }
    }

    case 'ADD_SHARED_FUND_CONTRIBUTION': {
      const { tripId, ...contributionData } = action.payload
      const contribution: SharedFundContribution = { id: uuidv4(), ...contributionData }
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === tripId ? { ...t, sharedFund: [...t.sharedFund, contribution] } : t
        ),
      }
    }

    case 'LOAD_STATE':
      return action.payload

    default:
      return state
  }
}

const STORAGE_KEY = 'travel-split-app-state'

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { trips: [] }
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppState must be used within AppProvider')
  return context
}

export type { Action }
