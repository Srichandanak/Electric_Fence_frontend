import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// ⚡ Custom red marker icon
const redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const AlertMap = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const ws = new WebSocket("ws://127.0.0.1:8000/ws");

        ws.onopen = () => {
            console.log("✅ WebSocket connected to backend");
        };

        ws.onmessage = (event) => {
            console.log("⚡ Raw message from backend:", event.data);
            try {
                const data = JSON.parse(event.data);
                console.log("⚡ Parsed alert:", data);

                const mappedAlert = {
                    ...data,
                    latitude: 9 + data.y,
                    longitude: 78 + data.x
                };
                setAlerts(prev => [...prev, mappedAlert]);
            } catch (err) {
                console.error("❌ Failed to parse WS message:", err, event.data);
            }
        };

        ws.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        ws.onclose = () => {
            console.log("🔌 WebSocket closed");
        };

        return () => ws.close();
    }, []);


    return (
        <MapContainer
            center={[10.5, 78.5]} // Tamil Nadu region
            zoom={7}
            style={{ width: "100%", height: "80vh" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {alerts.map((alert, idx) => (
                <Marker
                    key={idx}
                    position={[alert.latitude, alert.longitude]}
                    icon={redIcon}
                >
                    <Popup>
                        ⚡ <b>Threat Detected!</b><br />
                        Leakage: {alert.leakage_current.toFixed(3)} A<br />
                        Location: ({alert.latitude.toFixed(2)}, {alert.longitude.toFixed(2)})
                    </Popup>
                </Marker>
            ))}

        </MapContainer>
    );
};

export default AlertMap;
