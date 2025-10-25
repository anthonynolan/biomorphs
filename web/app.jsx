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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

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

  const fetchGrids = async (payload = null) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchGrids();
  }, []);

  if (loading) return <div className="status">Loading…</div>;
  if (error)
    return (
      <div className="status error">
        Error: {error} <button onClick={() => fetchGrids()}>Retry</button>
      </div>
    );

  return (
    <div className="wrapper">
      <h1>Grids</h1>
      <div className="controls">
        <button onClick={() => fetchGrids()}>New Grids</button>
        <span className="meta">{grids.length} grid(s)</span>
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

