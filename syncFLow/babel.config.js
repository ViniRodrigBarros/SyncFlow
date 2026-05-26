module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // WatermelonDB usa decorators "legacy" para campos dos models.
      // Precisa vir antes de qualquer plugin que mexa em class fields.
      ['@babel/plugin-proposal-decorators', { legacy: true }],

      // babel-preset-expo registra o flow-strip-types sem `allowDeclareFields`
      // (hard-coded em build/configs/flow.js). Como precisamos do `declare` nos
      // campos com decorator do WatermelonDB, executamos o mesmo plugin ANTES
      // do preset, com a opção ligada — assim o `declare` é consumido aqui e o
      // plugin do preset, quando rodar depois, não encontra mais nada para
      // reclamar.
      ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
    ],
  };
};
