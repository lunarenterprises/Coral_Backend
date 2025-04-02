module.exports = function (io) {
    // In-memory structures for managing available admins, user queues, and tickets
    let availableAdmins = [];  // List of available admin IDs
    let userQueue = [];  // Queue of users waiting for admin help
    let tickets = [];  // List of active tickets with chat history

    io.on('connection', (socket) => {
        console.log('A user or admin connected:', socket.id);

        // Admin Login & Availability
        socket.on('admin:login', (adminId) => {
            console.log(`Admin ${adminId} logged in`);
            availableAdmins.push(adminId);
            io.to(adminId).emit('admin:status', { available: true });

            // If there are any users in the queue, assign them to this admin
            if (userQueue.length > 0) {
                const nextUser = userQueue.shift();
                const ticketId = Date.now();  // Generate a unique ticket ID
                tickets.push({
                    ticketId,
                    userId: nextUser.userId,
                    adminId,
                    messages: [{ sender: 'admin', message: nextUser.message }]  // Include the user's initial message
                });
                io.to(adminId).emit('admin:newChat', { ticketId, userId: nextUser.userId, message: nextUser.message });
                io.to(nextUser.userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
            }
        });

        // User Sends Message (Goes to Queue or Admin)
        socket.on('user:sendMessage', (data) => {
            const { userId, message } = data;
            console.log(`User ${userId} sent message: ${message}`);

            // If there are available admins, assign the user to an admin
            if (availableAdmins.length > 0) {
                const adminId = availableAdmins.pop();
                const ticketId = Date.now();  // Generate a unique ticket ID
                tickets.push({
                    ticketId,
                    userId,
                    adminId,
                    messages: [{ sender: 'user', message }]
                });

                io.to(adminId).emit('admin:newChat', { ticketId, userId, message });
                io.to(userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
            } else {
                userQueue.push({ userId, message });
                console.log(`User ${userId} added to the queue`);
            }
        });

        // Admin Sends Message to User (NEW EVENT)
        socket.on('admin:sendMessage', (data) => {
            const { adminId, userId, ticketId, message } = data;
            console.log(`Admin ${adminId} sent message to user ${userId}: ${message}`);

            // Find the ticket and add the admin's message to the history
            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket) {
                ticket.messages.push({ sender: 'admin', message });
                io.to(userId).emit('user:receiveMessage', { adminId, message });
            }
        });

        // Admin Toggles Availability
        socket.on('admin:toggleAvailability', (adminId, isAvailable) => {
            if (isAvailable) {
                availableAdmins.push(adminId);
                if (userQueue.length > 0) {
                    const nextUser = userQueue.shift();
                    const ticketId = Date.now();
                    tickets.push({
                        ticketId,
                        userId: nextUser.userId,
                        adminId,
                        messages: [{ sender: 'admin', message: nextUser.message }]
                    });
                    io.to(adminId).emit('admin:newChat', { ticketId, userId: nextUser.userId, message: nextUser.message });
                    io.to(nextUser.userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
                }
            } else {
                const index = availableAdmins.indexOf(adminId);
                if (index > -1) availableAdmins.splice(index, 1);
            }
        });

        // Admin Finishes Chat (Ticket Complete)
        socket.on('admin:finishChat', (adminId, ticketId) => {
            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket) {
                io.to(ticket.userId).emit('user:receiveMessage', { adminId, message: "Thank you for chatting with us!" });
                
                // Mark the admin as available again
                availableAdmins.push(adminId);
                
                // If there are users in the queue, assign the next one
                if (userQueue.length > 0) {
                    const nextUser = userQueue.shift();
                    const newTicketId = Date.now();
                    tickets.push({
                        ticketId: newTicketId,
                        userId: nextUser.userId,
                        adminId,
                        messages: [{ sender: 'admin', message: nextUser.message }]
                    });
                    io.to(adminId).emit('admin:newChat', { ticketId: newTicketId, userId: nextUser.userId, message: nextUser.message });
                    io.to(nextUser.userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
                }
            }
        });

        // Admin Invites Another Expert (Transfer the Ticket)
        socket.on('admin:inviteExpert', (fromAdminId, toAdminId, ticketId) => {
            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket && ticket.adminId === fromAdminId) {
                // Transfer the ticket to the new admin
                ticket.adminId = toAdminId;

                // Notify both the new admin and the user
                io.to(toAdminId).emit('admin:loadChat', ticket.messages);
                io.to(ticket.userId).emit('user:receiveMessage', { adminId: toAdminId, message: "Another expert admin is joining your chat." });
                io.to(fromAdminId).emit('admin:status', { available: true });  // Make original admin available again
            }
        });

        // Admin Leaves Chat (Disconnect)
        socket.on('disconnect', () => {
            const adminIndex = availableAdmins.indexOf(socket.id);
            if (adminIndex > -1) availableAdmins.splice(adminIndex, 1);

            // Remove any user waiting for this admin
            userQueue = userQueue.filter(user => user.userId !== socket.id);
        });
    });
};
