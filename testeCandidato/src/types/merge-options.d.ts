// Shim para silenciar TS(7016) em arquivos de node_modules que importam
// `merge-options` (ex.: @react-native-async-storage/async-storage). A lib tem
// um `index.d.ts` real, mas o `exports` do package.json dela não declara o
// campo `types`, então `moduleResolution: "bundler"` não acha as tipagens.
// Bug upstream em `merge-options@3.x`. Não afeta runtime — só diagnostics.
declare module 'merge-options' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergeOptions: any;
  export default mergeOptions;
}
