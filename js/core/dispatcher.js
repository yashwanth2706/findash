// ─────────────────────────────────────────────
// DISPATCHER
// ─────────────────────────────────────────────
function dispatch(action) {
  state = reducer(state, action);
  render(state);
}
