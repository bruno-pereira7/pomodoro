import { useCallback, useState } from 'react'
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  type HistoryEntry,
  type StorageLike,
} from '../lib/storage'

export function useHistory(storage: StorageLike) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory(storage))

  const add = useCallback(
    (entry: HistoryEntry) => {
      setEntries(addHistoryEntry(storage, entry))
    },
    [storage],
  )

  const clear = useCallback(() => {
    clearHistory(storage)
    setEntries([])
  }, [storage])

  return { entries, add, clear }
}
