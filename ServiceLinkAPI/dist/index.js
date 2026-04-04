"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const clientRoutes_1 = require("./routes/clientRoutes");
const cors_1 = __importDefault(require("cors"));
const mainRoutes_1 = require("./routes/mainRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const providerRoutes_1 = require("./routes/providerRoutes");
const path_1 = __importDefault(require("path"));
const fileHandler_1 = require("./middlewares/fileHandler");
const http_1 = __importDefault(require("http"));
const socketServer_1 = require("./server/socketServer");
const os_1 = __importDefault(require("os"));
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
// Create HTTP server
const server = http_1.default.createServer(app);
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Increase payload size limit for file uploads
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Configure static file serving for uploads
(0, fileHandler_1.configureStaticFileServing)(app);
// Serve HTML test pages
app.get('/provider-booking', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'providerBooking.html'));
});
app.get('/client-address', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'clientaddress.html'));
});
app.get('/client-booking', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'clientBooking.html'));
});
app.get('/chat', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'chat.html'));
});
app.get('/provider-fillup', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'indexprovider.html'));
});
app.get('/provider-register', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'providerRegister.html'));
});
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'admin-dashboard.html'));
});
app.get('/fetchfunctions', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'fetchfunctions.html'));
});
// Routes
app.use('/api/provider', providerRoutes_1.providerRoutes);
app.use('/api/client', clientRoutes_1.clientRoutes);
app.use('/api', mainRoutes_1.mainRoutes);
app.use('/api/admin', adminRoutes_1.adminRoutes);
app.get('/', (req, res) => {
    res.send('API is running!');
});
const PORT = 5500;
const HOST = '0.0.0.0';
// Function to get all local IP addresses
function getAllLocalIpAddresses() {
    const addresses = [];
    const networks = os_1.default.networkInterfaces();
    for (const name of Object.keys(networks)) {
        for (const net of networks[name] || []) {
            // Only get IPv4 addresses and skip internal ones
            if (net.family === 'IPv4' && !net.internal) {
                addresses.push(net.address);
            }
        }
    }
    return addresses.length ? addresses : ['localhost'];
}
// Setup Socket.IO server
exports.io = (0, socketServer_1.setupSocketServer)(server);
// Start the server
server.listen(PORT, () => {
    const localIPs = getAllLocalIpAddresses();
    console.log(`🚀 Server is running at:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network addresses:`);
    localIPs.forEach((ip, index) => {
        console.log(`   ${index + 1}. http://${ip}:${PORT}`);
    });
    console.log(`🔌 WebSocket server is running on the same port`);
});
