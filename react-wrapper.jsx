// react-wrapper.jsx
// Lightweight React wrapper for DataGrid
import React, { useEffect, useRef } from 'react';
// Assumes data-grid.js is available as an ES module

export default function DataGridReactWrapper({ apiEndpoint, columns }) {
  const gridRef = useRef(null);

  useEffect(() => {
    let gridInstance;
    import('./data-grid.js').then(({ DataGrid }) => {
      gridInstance = new DataGrid({
        container: gridRef.current,
        apiEndpoint,
        columns
      });
    });
    return () => {
      // Optionally: clean up if needed
      if (gridRef.current) gridRef.current.innerHTML = '';
    };
  }, [apiEndpoint, columns]);

  return (
    <div className="data-grid-container" ref={gridRef}></div>
  );
}
