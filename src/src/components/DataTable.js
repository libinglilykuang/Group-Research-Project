// CsvTable.jsx
import React, { useEffect, useState } from "react";
import Papa from "papaparse";


export default function CsvTable() {
  const [rows, setRows] = useState([]);

  
  useEffect(() => {
    // because the CSV is inside public/, you can fetch it like any image
    fetch(process.env.PUBLIC_URL + "/data_points.csv")
      .then((res) => res.text())
      .then((csv) => {
        const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
        setRows(data);
      })
      .catch(console.error);
  }, []);

  if (!rows.length) return <p>Loading…</p>;

  return (
    <div                  //  ← wrapper
      style={{
        maxHeight: "320px",    // pick any height you like
        overflowY: "auto",
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "6px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Utc Sample Time</th>
            <th style={th}>Numeric Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={td}>{r.UtcSampleTime}</td>
              <td style={td}>{r.NumericValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { border: "1px solid #ddd", padding: "4px", background: "#f7f7f7" };
const td = { border: "1px solid #ddd", padding: "4px" };
