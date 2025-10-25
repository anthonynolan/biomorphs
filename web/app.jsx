function Grid({ data, onClick }) {
  const rows = data.length;
  const cols = rows ? data[0].length : 0;
  return (
    <div
      className="grid-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="grid-meta">{rows} × {cols}</div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, var(--cell))` }}>
        {data.flatMap((row, r) =>
          row.map((v, c) => (
            <div key={`${r}-${c}`} className={`cell ${v ? 'filled' : 'empty'}`} />
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  const [grids, setGrids] = React.useState([]);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [playing, setPlaying] = React.useState(false);
  const [intervalMs, setIntervalMs] = React.useState(500);

  const normalizeToList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data; // assume already list of grids
    if (Array.isArray(data.grids)) return data.grids;
    // keyed map (grid_0, grid_1, ...)
    const keys = Object.keys(data)
      .filter((k) => k.startsWith('grid_'))
      .sort((a, b) => {
        const ai = parseInt(a.split('_')[1], 10);
        const bi = parseInt(b.split('_')[1], 10);
        return isNaN(ai) || isNaN(bi) ? a.localeCompare(b) : ai - bi;
      });
    return keys.map((k) => data[k]);
  };

  const fetchGrids = async (payload = null, { showSpinner = true } = {}) => {
    try {
      if (showSpinner) setInitialLoading(true);
      setFetching(true);
      setError(null);
      const url = 'http://localhost:8000/grid';
      const opts = {
        method: 'POST',
        headers: payload
          ? { 'Content-Type': 'application/json', Accept: 'application/json' }
          : { Accept: 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      };
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setGrids(normalizeToList(data));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      if (showSpinner) setInitialLoading(false);
      setFetching(false);
    }
  };

  React.useEffect(() => {
    fetchGrids();
  }, []);

  // Drive the simulation with a timer when playing
  React.useEffect(() => {
    if (!playing) return;
    if (!grids || grids.length === 0) return;
    const id = setInterval(() => {
      // Send current grids to server to receive next generation
      fetchGrids({ grids }, { showSpinner: false });
    }, Math.max(50, intervalMs));
    return () => clearInterval(id);
  }, [playing, intervalMs, grids]);

  const togglePlay = () => setPlaying((p) => !p);
  const stepOnce = () => fetchGrids({ grids }, { showSpinner: false });
  const faster = () => setIntervalMs((ms) => Math.max(50, Math.round(ms * 0.7)));
  const slower = () => setIntervalMs((ms) => Math.min(4000, Math.round(ms / 0.7)));
  const reset = () => fetchGrids();

  if (initialLoading) return <div className="status">Loading…</div>;
  if (error)
    return (
      <div className="status error">
        Error: {error} <button onClick={() => fetchGrids()}>Retry</button>
      </div>
    );

  return (
    <div className="wrapper">
      <h1>Conway’s Game of Life</h1>
      <div className="controls">
        <button onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
        <button onClick={stepOnce} disabled={playing || fetching}>Step</button>
        <button onClick={slower}>Slower</button>
        <button onClick={faster}>Faster</button>
        <button onClick={reset} disabled={fetching}>New Grids</button>
        <span className="meta">{grids.length} grid(s)</span>
        <span className="meta">Speed: {intervalMs} ms {fetching ? '(updating…)': ''}</span>
      </div>
      <div className="grid-list">
        {grids.map((g, idx) => (
          <Grid key={idx} data={g} onClick={() => fetchGrids({ grids: [g] })} />
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
