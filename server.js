// server.js
import { serve, file } from "bun";

const PORT = 3000;

serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        // 1. Serve static files (HTML, CSS, JS)
        if (url.pathname === "/" || url.pathname === "/index.html") {
            return new Response(file("./index.html"));
        }
        if (url.pathname === "/css/style.css") {
            return new Response(file("./css/style.css"));
        }
        if (url.pathname === "/js/clock.js") {
            return new Response(file("./js/clock.js"));
        }

        // 2. HTMX Endpoint: Generate the HTML table for the departures
        if (url.pathname === "/board") {
            const station = url.searchParams.get("station") || "";
            const limit = url.searchParams.get("results") || "5";
            const interval = url.searchParams.get("intervall") || "60";

            if (!station) return new Response("Bitte Bahnhof eingeben.");

            try {
                // Fetch JSON from the open data API
                const apiRes = await fetch(
                    `https://transport.opendata.ch/v1/stationboard?station=${encodeURIComponent(
                        station,
                    )}&limit=${limit}`,
                );
                const data = await apiRes.json();

                // Build the HTML to send back to HTMX
                // Notice the hx-get and hx-trigger attributes that enable automatic polling!
                let html = ``;

                if (data.stationboard && data.stationboard.length > 0) {
                    const stationname = data.station.name;
                    html += `
                    <div id="board-container"
                        hx-get="/board?station=${encodeURIComponent(station)}&results=${limit}&intervall=${interval}"
                        hx-trigger="every ${interval}s"
                        hx-swap="outerHTML">

                      <h2 id="bahnhof">${stationname}</h2>
                      <table id="list">
                        <thead>
                          <tr>
                            <th>Linie</th>
                            <th>Ziel</th>
                            <th>Gleis</th>
                            <th>Abfahrt</th>
                            <th>Hinweis</th>
                          </tr>
                        </thead>
                        <tbody>
                  `;
                    for (const item of data.stationboard) {
                        const linie = `${item.category} ${item.number}`;
                        const ziel = item.to;
                        const gleis = item.stop.platform || "-";

                        const d = new Date(item.stop.departure);
                        const abfahrtStr = d
                            .toLocaleTimeString("de-CH", {
                                timeZone: "Europe/Zurich",
                            })
                            .substring(0, 5);

                        const hinweis = item.stop.delay
                            ? `+ ${item.stop.delay}'`
                            : " ";

                        html += `
              <tr>
                <td id="linie">${linie}</td>
                <td>${ziel}</td>
                <td>${gleis}</td>
                <td>${abfahrtStr}</td>
                <td style="color: yellow;">${hinweis}</td>
              </tr>
            `;
                    }
                } else {
                    html += `
                    <div id="board-container"
                        hx-get="/board?station=${encodeURIComponent(station)}&results=${limit}&intervall=${interval}"
                        hx-trigger="every ${interval}s"
                        hx-swap="outerHTML">
                      <table id="list">
                        <thead>
                          <tr>
                            <th>Linie</th>
                            <th>Ziel</th>
                            <th>Gleis</th>
                            <th>Abfahrt</th>
                            <th>Hinweis</th>
                          </tr>
                          <tr><td colspan="5">Keine Daten gefunden für ${station}</td></tr>
                        </thead>
                        <tbody>
                    `;
                }

                html += `
              </tbody>
            </table>
          </div>
        `;

                // Trigger a custom event on the client if we have valid data
                const headers = new Headers({
                    "Content-Type": "text/html; charset=utf-8",
                });
                if (data.stationboard && data.stationboard.length > 0) {
                    headers.set("HX-Trigger", "hideForm");
                }

                return new Response(html, { headers });
            } catch (err) {
                return new Response(
                    `<div id="board-container">Fehler beim Laden der API</div>`,
                    {
                        headers: { "Content-Type": "text/html; charset=utf-8" },
                    },
                );
            }
        }

        return new Response("Not found", { status: 404 });
    },
});

console.log(`🚀 Server running with Bun at http://localhost:${PORT}`);
