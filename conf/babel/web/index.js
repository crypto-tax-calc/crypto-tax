module.exports = () => ({
  presets: [require('@babel/preset-typescript'), require('@babel/preset-react'), [require('@babel/preset-env'), { targets: { node: 'current' } }]]
})
