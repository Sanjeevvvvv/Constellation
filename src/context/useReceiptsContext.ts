import { useContext } from 'react';
import { ReceiptsContext } from './ReceiptsContext';

export function useReceiptsContext() {
  const ctx = useContext(ReceiptsContext);
  if (!ctx) throw new Error('useReceiptsContext must be used inside ReceiptsProvider');
  return ctx;
}
