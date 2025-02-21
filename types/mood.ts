export interface Sleep {
  hours: number
  quality: number
}

export interface MoodEntry {
  _id?: string
  userId: string
  date: string
  mood: number
  sleep: Sleep
  anxiety: number
  stress: number
  activities: string[]
  note?: string
}

export interface NewEntryFormData {
  date: string
  mood: number
  sleep: Sleep
  anxiety: number
  stress: number
  activities: string[]
  note?: string
}

