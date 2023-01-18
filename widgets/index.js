// index.js is the default entry point when building the module in this directory.
// It imports all the .vue files (i.e. all widgets here) and re-exports them, so the
// exports of the entire module consists of the widgets.
export default import.meta.globEager("./*.vue")
