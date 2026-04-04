"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNotification = exports.emitBookingUpdate = exports.setupSocketServer = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Socket user mapping - to track which user is connected to which socket
const connectedUsers = new Map(); // userId -> socketId[]
const setupSocketServer = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        path: '/socket',
        transports: ['websocket', 'polling'],
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication token is required'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            next();
        }
        catch (error) {
            return next(new Error('Invalid or expired token'));
        }
    });
    io.on('connection', (socket) => {
        var _a, _b;
        console.log(`Socket connected: ${socket.id}`);
        const userId = (_a = socket.data.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            // Store socket connection for the user
            if (!connectedUsers.has(userId)) {
                connectedUsers.set(userId, []);
            }
            (_b = connectedUsers.get(userId)) === null || _b === void 0 ? void 0 : _b.push(socket.id);
            // Join user to their own room for targeted messages
            socket.join(`user:${userId}`);
            // Notify user they are connected
            socket.emit('connected', { message: 'You are connected to the chat server' });
        }
        // Handle joining a specific conversation
        socket.on('join-conversation', (conversationId) => {
            if (!userId)
                return;
            // Join the conversation room
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${userId} joined conversation ${conversationId}`);
        });
        // Handle leaving a conversation
        socket.on('leave-conversation', (conversationId) => {
            if (!userId)
                return;
            // Leave the conversation room
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${userId} left conversation ${conversationId}`);
        });
        // Handle new message
        socket.on('new-message', (_a) => __awaiter(void 0, [_a], void 0, function* ({ conversationId, content, imageUrl }) {
            if (!userId || !conversationId)
                return;
            try {
                // Get conversation to find the other user
                const conversation = yield prisma.conversation.findUnique({
                    where: { id: conversationId },
                    select: { user1Id: true, user2Id: true }
                });
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }
                // Check if user is part of this conversation
                if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
                    socket.emit('error', { message: 'You are not authorized to send messages in this conversation' });
                    return;
                }
                // Determine the recipient
                const recipientId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
                // Create the message in database
                const message = yield prisma.message.create({
                    data: {
                        conversationId,
                        senderId: userId,
                        receiverId: recipientId,
                        content: content || '',
                        imageUrl,
                        isRead: false
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true
                            }
                        }
                    }
                });
                // Format the message for the client
                const formattedMessage = {
                    id: message.id,
                    content: message.content,
                    imageUrl: message.imageUrl,
                    createdAt: message.createdAt,
                    isRead: message.isRead,
                    sender: {
                        id: message.sender.id,
                        firstName: message.sender.firstName,
                        lastName: message.sender.lastName,
                        profilePicture: message.sender.profilePicture
                    }
                };
                // Broadcast to the conversation room
                io.to(`conversation:${conversationId}`).emit('message', formattedMessage);
                // Also send to specific user's room if they're not in the conversation room
                // This ensures offline users will get the message when they come online
                io.to(`user:${recipientId}`).emit('new-message-notification', {
                    conversationId,
                    message: formattedMessage
                });
                // Create a notification
                try {
                    yield prisma.notification.create({
                        data: {
                            receiverId: recipientId,
                            type: 'NEW_MESSAGE',
                            title: 'New Message',
                            message: `${message.sender.firstName} sent you a message`,
                            data: JSON.stringify({
                                conversationId,
                                messageId: message.id,
                                senderId: userId
                            }),
                            isRead: false
                        }
                    });
                }
                catch (notifError) {
                    console.error('Error creating notification:', notifError);
                    // Continue even if notification creation fails
                }
                // Update the conversation's updatedAt timestamp
                yield prisma.conversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() }
                });
            }
            catch (error) {
                console.error('Error handling new message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        }));
        // Handle read receipts
        socket.on('mark-read', (_a) => __awaiter(void 0, [_a], void 0, function* ({ conversationId }) {
            if (!userId || !conversationId)
                return;
            try {
                // Mark all messages as read
                yield prisma.message.updateMany({
                    where: {
                        conversationId,
                        receiverId: userId,
                        isRead: false
                    },
                    data: {
                        isRead: true
                    }
                });
                // Notify the sender that messages were read
                io.to(`conversation:${conversationId}`).emit('messages-read', {
                    conversationId,
                    readBy: userId
                });
            }
            catch (error) {
                console.error('Error marking messages as read:', error);
            }
        }));
        // Handle typing indicator
        socket.on('typing', ({ conversationId, isTyping }) => {
            if (!userId || !conversationId)
                return;
            // Broadcast typing status to the conversation
            socket.to(`conversation:${conversationId}`).emit('user-typing', {
                conversationId,
                userId,
                isTyping
            });
        });
        // Handle notifications
        socket.on('send-notification', (_a) => __awaiter(void 0, [_a], void 0, function* ({ recipientId, type, title, message, data }) {
            if (!userId || !recipientId)
                return;
            try {
                // Store notification in database
                const notification = yield prisma.notification.create({
                    data: {
                        receiverId: recipientId,
                        type,
                        title,
                        message,
                        data: data ? JSON.stringify(data) : null,
                        isRead: false
                    }
                });
                // Send to recipient if online
                io.to(`user:${recipientId}`).emit('notification', {
                    id: notification.id,
                    type,
                    title,
                    message,
                    data,
                    createdAt: notification.createdAt,
                    isRead: false
                });
            }
            catch (error) {
                console.error('Error sending notification:', error);
            }
        }));
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            if (userId) {
                // Remove this socket from user's connections
                const userSockets = connectedUsers.get(userId) || [];
                const updatedSockets = userSockets.filter(id => id !== socket.id);
                if (updatedSockets.length > 0) {
                    connectedUsers.set(userId, updatedSockets);
                }
                else {
                    connectedUsers.delete(userId);
                }
            }
        });
    });
    return io;
};
exports.setupSocketServer = setupSocketServer;
// Export function to emit booking updates
const emitBookingUpdate = (io, bookingId, bookingData, userIds) => {
    userIds.forEach(userId => {
        io.to(`user:${userId}`).emit('booking-updated', {
            bookingId,
            booking: bookingData
        });
    });
};
exports.emitBookingUpdate = emitBookingUpdate;
// Export function to emit notification
const emitNotification = (io, userId, notification) => {
    io.to(`user:${userId}`).emit('notification', notification);
};
exports.emitNotification = emitNotification;
