// import React, { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';


// // ⚡ Custom red marker icon
// const redIcon = new L.Icon({
//     iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//     shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
// });

// const AlertMap = () => {
//     const [alerts, setAlerts] = useState([]);

//     useEffect(() => {
//         const ws = new WebSocket("ws://127.0.0.1:8000/ws");

//         ws.onopen = () => {
//             console.log("✅ WebSocket connected to backend");
//         };

//         ws.onmessage = (event) => {
//             console.log("⚡ Raw message from backend:", event.data);
//             try {
//                 const data = JSON.parse(event.data);
//                 console.log("⚡ Parsed alert:", data);

//                 const mappedAlert = {
//                     ...data,
//                     latitude: 9 + data.y,
//                     longitude: 78 + data.x
//                 };
//                 setAlerts(prev => [...prev, mappedAlert]);
//             } catch (err) {
//                 console.error("❌ Failed to parse WS message:", err, event.data);
//             }
//         };

//         ws.onerror = (err) => {
//             console.error("❌ WebSocket error:", err);
//         };

//         ws.onclose = () => {
//             console.log("🔌 WebSocket closed");
//         };

//         return () => ws.close();
//     }, []);


//     return (
//         <MapContainer
//             center={[10.5, 78.5]} // Tamil Nadu region
//             zoom={7}
//             style={{ width: "100%", height: "80vh" }}
//         >
//             <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution="&copy; OpenStreetMap contributors"
//             />
//             {alerts.map((alert, idx) => (
//                 <Marker
//                     key={idx}
//                     position={[alert.latitude, alert.longitude]}
//                     icon={redIcon}
//                 >
//                     <Popup>
//                         ⚡ <b>Threat Detected!</b><br />
//                         Leakage: {alert.leakage_current.toFixed(3)} A<br />
//                         Location: ({alert.latitude.toFixed(2)}, {alert.longitude.toFixed(2)})
//                     </Popup>
//                 </Marker>
//             ))}

//         </MapContainer>
//     );
// };

// export default AlertMap;
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Zap, MapPin, Activity, Wifi, WifiOff, Bell, Plus, Minus } from 'lucide-react';

const AlertMap = () => {
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [totalAlerts, setTotalAlerts] = useState(0);
    const [criticalAlerts, setCriticalAlerts] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Tamil Nadu approximate boundaries and major cities for reference
    const tamilNaduBounds = {
        minLat: 8.0,
        maxLat: 13.5,
        minLng: 76.0,
        maxLng: 80.5
    };

    const majorCities = [
        { name: "Chennai", lat: 13.0827, lng: 80.2707 },
        { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
        { name: "Madurai", lat: 9.9252, lng: 78.1198 },
        { name: "Tiruchirappalli", lat: 10.7905, lng: 78.7047 },
        { name: "Salem", lat: 11.6643, lng: 78.1460 }
    ];

    useEffect(() => {
        const ws = new WebSocket("ws://127.0.0.1:8000/ws");

        ws.onopen = () => {
            console.log("✅ WebSocket connected to backend");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            console.log("⚡ Raw message from backend:", event.data);
            try {
                const data = JSON.parse(event.data);
                console.log("⚡ Parsed alert:", data);

                const mappedAlert = {
                    ...data,
                    latitude: 9 + data.y,
                    longitude: 78 + data.x,
                    timestamp: new Date().toLocaleTimeString(),
                    id: Date.now() + Math.random()
                };
                
                setAlerts(prev => [...prev, mappedAlert]);
                setTotalAlerts(prev => prev + 1);
                
                if (mappedAlert.leakage_current > 0.5) {
                    setCriticalAlerts(prev => prev + 1);
                }
            } catch (err) {
                console.error("❌ Failed to parse WS message:", err, event.data);
            }
        };

        ws.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log("🔌 WebSocket closed");
            setIsConnected(false);
        };

        return () => ws.close();
    }, []);

    const clearAlerts = () => {
        setAlerts([]);
        setTotalAlerts(0);
        setCriticalAlerts(0);
        setSelectedAlert(null);
    };

    const convertToSVGCoords = (lat, lng) => {
        const x = ((lng - tamilNaduBounds.minLng) / (tamilNaduBounds.maxLng - tamilNaduBounds.minLng)) * 800 * zoom;
        const y = ((tamilNaduBounds.maxLat - lat) / (tamilNaduBounds.maxLat - tamilNaduBounds.minLat)) * 600 * zoom;
        return { x, y };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navbar */}
            <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">PowerGuard</h1>
                                <p className="text-sm text-gray-300">Real-time Threat Detection</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                {isConnected ? (
                                    <div className="flex items-center space-x-2 text-green-400">
                                        <Wifi className="w-4 h-4" />
                                        <span className="text-sm font-medium">Connected</span>
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-red-400">
                                        <WifiOff className="w-4 h-4" />
                                        <span className="text-sm font-medium">Disconnected</span>
                                    </div>
                                )}
                            </div>
                            
                            <button
                                onClick={clearAlerts}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                            >
                                Clear Alerts
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm font-medium">Total Alerts</p>
                                <p className="text-3xl font-bold text-white">{totalAlerts}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm font-medium">Critical Alerts</p>
                                <p className="text-3xl font-bold text-red-400">{criticalAlerts}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-300 text-sm font-medium">Active Monitoring</p>
                                <p className="text-3xl font-bold text-green-400">Tamil Nadu</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            <span>Live Threat Map - Tamil Nadu</span>
                        </h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span>Threat Detected</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-white text-sm font-medium">Zoom</span>
                                <button
                                    onClick={() => setZoom(Math.min(2, zoom + 0.2))}
                                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-blue-900/20 to-green-900/20" style={{ height: '70vh' }}>
                        <svg 
                            width="100%" 
                            height="100%" 
                            viewBox={`0 0 ${800 * zoom} ${600 * zoom}`}
                            className="cursor-move"
                        >
                            {/* Background grid */}
                            <defs>
                                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* Tamil Nadu outline (simplified) */}
                            <path
                                d="M 100 150 L 200 100 L 350 120 L 500 140 L 650 180 L 700 250 L 720 350 L 680 450 L 600 520 L 500 550 L 400 540 L 300 520 L 200 480 L 150 400 L 120 300 Z"
                                fill="rgba(34, 197, 94, 0.1)"
                                stroke="rgba(34, 197, 94, 0.5)"
                                strokeWidth="2"
                                transform={`scale(${zoom})`}
                            />
                            
                            {/* Major cities */}
                            {majorCities.map((city, idx) => {
                                const coords = convertToSVGCoords(city.lat, city.lng);
                                return (
                                    <g key={idx}>
                                        <circle
                                            cx={coords.x}
                                            cy={coords.y}
                                            r="4"
                                            fill="rgba(59, 130, 246, 0.8)"
                                            stroke="white"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={coords.x}
                                            y={coords.y - 10}
                                            fill="white"
                                            fontSize="12"
                                            textAnchor="middle"
                                            className="pointer-events-none"
                                        >
                                            {city.name}
                                        </text>
                                    </g>
                                );
                            })}
                            
                            {/* Alert markers */}
                            {alerts.map((alert) => {
                                const coords = convertToSVGCoords(alert.latitude, alert.longitude);
                                const isCritical = alert.leakage_current > 0.5;
                                return (
                                    <g key={alert.id}>
                                        <circle
                                            cx={coords.x}
                                            cy={coords.y}
                                            r="8"
                                            fill={isCritical ? "#ef4444" : "#f59e0b"}
                                            stroke="white"
                                            strokeWidth="2"
                                            className="cursor-pointer animate-pulse"
                                            onClick={() => setSelectedAlert(alert)}
                                        />
                                        <circle
                                            cx={coords.x}
                                            cy={coords.y}
                                            r="15"
                                            fill="none"
                                            stroke={isCritical ? "#ef4444" : "#f59e0b"}
                                            strokeWidth="1"
                                            opacity="0.3"
                                            className="animate-ping"
                                        />
                                        <text
                                            x={coords.x}
                                            y={coords.y + 3}
                                            fill="white"
                                            fontSize="10"
                                            textAnchor="middle"
                                            className="pointer-events-none font-bold"
                                        >
                                            ⚡
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Alert Details Panel */}
                {selectedAlert && (
                    <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                <Zap className="w-5 h-5 text-red-400" />
                                <span>Alert Details</span>
                            </h3>
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-300 text-sm">Leakage Current</p>
                                <p className="text-2xl font-bold text-red-400">{selectedAlert.leakage_current.toFixed(3)} A</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-300 text-sm">Location</p>
                                <p className="text-lg font-medium text-white">
                                    {selectedAlert.latitude.toFixed(4)}, {selectedAlert.longitude.toFixed(4)}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-gray-300 text-sm">Detected At</p>
                                <p className="text-lg font-medium text-white">{selectedAlert.timestamp}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                selectedAlert.leakage_current > 0.5 
                                    ? 'bg-red-500/20 text-red-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                                {selectedAlert.leakage_current > 0.5 ? 'Critical Threat' : 'Warning Level'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Recent Alerts */}
                {alerts.length > 0 && (
                    <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            <span>Recent Alerts</span>
                        </h3>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                            {alerts.slice(-5).reverse().map((alert) => (
                                <div 
                                    key={alert.id} 
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => setSelectedAlert(alert)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                        <div>
                                            <p className="text-white font-medium">
                                                Leakage: {alert.leakage_current.toFixed(3)} A
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                ({alert.latitude.toFixed(2)}, {alert.longitude.toFixed(2)})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-300 text-sm">{alert.timestamp}</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                            alert.leakage_current > 0.5 
                                                ? 'bg-red-500/20 text-red-400' 
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {alert.leakage_current > 0.5 ? 'Critical' : 'Warning'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertMap;