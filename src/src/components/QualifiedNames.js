import React, { useEffect, useState } from "react";
import Papa from "papaparse";

/**
 * Displays the list of qualified names stored in public/qualified_names.csv.
 * The component strips the long GUID prefix (everything up to and including
 * the first period) so only the readable part like "Alarm Data" is shown.
 */
export default function QualifiedNames() {
  const [names, setNames] = useState([]);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/qualified_names.csv")
      .then((res) => res.text())
      .then((csv) => {
        const { data } = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
        });
        // take everything after the first '.' (if present)
        const cleaned = data.map((row) => {
          const qn = row.QualifiedName || "";
          const dot = qn.indexOf(".");
          return dot === -1 ? qn : qn.slice(dot + 1);
        });
        setNames(cleaned);
      })
      .catch(console.error);
  }, []);

  if (!names.length) return <p>Loading…</p>;

  return (
    <div className="max-h-80 overflow-y-auto w-full border border-gray-300 rounded-2xl p-2 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1 bg-gray-100 text-left">Qualified Name</th>
          </tr>
        </thead>
        <tbody>
          {names.map((n, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
