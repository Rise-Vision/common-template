module.exports = {
  staticFileGlobs: [ "src/images/*", "shared_bundle_*.js" ],
  runtimeCaching: [
    { urlPattern: /^https:\/\/fonts.googleapis.com/, handler: "networkFirst" },
    { urlPattern: /^https:\/\/widgets.risevision.com/, handler: "networkFirst" }
  ]
}
