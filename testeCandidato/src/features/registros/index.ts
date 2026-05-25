export { RegistroFormView as RegistroFormScreen } from './presentation/RegistroFormView';
export { RegistroDetailView as RegistroDetailScreen } from './presentation/RegistroDetailView';
export { RegistroListView as RegistroListScreen } from './presentation/RegistroListView';
export { useRegistroFormViewModel } from './hooks/useRegistroFormViewModel';
export { useRegistroDetailViewModel } from './hooks/useRegistroDetailViewModel';
export {
  useRegistroListViewModel,
  type RegistroListViewModel,
  type StatusFilter,
  type TipoFilter,
} from './hooks/useRegistroListViewModel';
export type { RegistroFormViewModel } from './hooks/useRegistroFormViewModel';
export type { RegistroDetailViewModel } from './hooks/useRegistroDetailViewModel';
