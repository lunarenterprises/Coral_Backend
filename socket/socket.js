// module.exports = function (io) {
//     // In-memory structures for managing available admins, user queues, and tickets
//     let availableAdmins = [];  // List of available admin IDs
//     let userQueue = [];  // Queue of users waiting for admin help
//     let tickets = [];  // List of active tickets with chat history

//     io.on('connection', (socket) => {
//         console.log('A user or admin connected:', socket.id);

//         // Admin Login & Availability
//         socket.on('admin:login', (adminId) => {
//             console.log(`Admin ${adminId} logged in`);
//             availableAdmins.push(adminId);
//             io.to(adminId).emit('admin:status', { available: true });

//             // If there are any users in the queue, assign them to this admin
//             if (userQueue.length > 0) {
//                 const nextUser = userQueue.shift();
//                 const ticketId = Date.now();  // Generate a unique ticket ID
//                 tickets.push({
//                     ticketId,
//                     userId: nextUser.userId,
//                     adminId,
//                     messages: [{ sender: 'admin', message: nextUser.message }]  // Include the user's initial message
//                 });
//                 io.to(adminId).emit('admin:newChat', { ticketId, userId: nextUser.userId, message: nextUser.message });
//                 io.to(nextUser.userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
//             }
//         });

//         // User Sends Message (Goes to Queue or Admin)
//         socket.on('user:sendMessage', (data) => {
//             const { userId, message } = data;
//             console.log(`User ${userId} sent message: ${message}`);

//             // If there are available admins, assign the user to an admin
//             if (availableAdmins.length > 0) {
//                 const adminId = availableAdmins.pop();
//                 const ticketId = Date.now();  // Generate a unique ticket ID
//                 tickets.push({
//                     ticketId,
//                     userId,
//                     adminId,
//                     messages: [{ sender: 'user', message }]
//                 });

//                 io.to(adminId).emit('admin:newChat', { ticketId, userId, message });
//                 io.to(userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
//             } else {
//                 userQueue.push({ userId, message });
//                 console.log(`User ${userId} added to the queue`);
//             }
//         });

//         // Admin Sends Message to User (NEW EVENT)
//         socket.on('admin:sendMessage', (data) => {
//             const { adminId, userId, ticketId, message } = data;
//             console.log(`Admin ${adminId} sent message to user ${userId}: ${message}`);

//             // Find the ticket and add the admin's message to the history
//             const ticket = tickets.find(t => t.ticketId === ticketId);
//             if (ticket) {
//                 ticket.messages.push({ sender: 'admin', message });
//                 io.to(userId).emit('user:receiveMessage', { adminId, message });
//             }
//         });

//         // Admin Toggles Availability
//         socket.on('admin:toggleAvailability', (adminId, isAvailable) => {
//             if (isAvailable) {
//                 availableAdmins.push(adminId);
//                 if (userQueue.length > 0) {
//                     const nextUser = userQueue.shift();
//                     const ticketId = Date.now();
//                     tickets.push({
//                         ticketId,
//                         userId: nextUser.userId,
//                         adminId,
//                         messages: [{ sender: 'admin', message: nextUser.message }]
//                     });
//                     io.to(adminId).emit('admin:newChat', { ticketId, userId: nextUser.userId, message: nextUser.message });
//                     io.to(nextUser.userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
//                 }
//             } else {
//                 const index = availableAdmins.indexOf(adminId);
//                 if (index > -1) availableAdmins.splice(index, 1);
//             }
//         });

//         // Admin Finishes Chat (Ticket Complete)
//         socket.on('admin:finishChat', (adminId, ticketId) => {
//             const ticket = tickets.find(t => t.ticketId === ticketId);
//             if (ticket) {
//                 io.to(ticket.userId).emit('user:receiveMessage', { adminId, message: "Thank you for chatting with us!" });
                
//                 // Mark the admin as available again
//                 availableAdmins.push(adminId);
                
//                 // If there are users in the queue, assign the next one
//                 if (userQueue.length > 0) {
//                     const nextUser = userQueue.shift();
//                     const newTicketId = Date.now();
//                     tickets.push({
//                         ticketId: newTicketId,
//                         userId: nextUser.userId,
//                         adminId,
//                         messages: [{ sender: 'admin', message: nextUser.message }]
//                     });
//                     io.to(adminId).emit('admin:newChat', { ticketId: newTicketId, userId: nextUser.userId, message: nextUser.message });
//                     io.to(nextUser.userId).emit('user:receiveMessage', { adminId, message: "An admin is available to help you!" });
//                 }
//             }
//         });

//         // Admin Invites Another Expert (Transfer the Ticket)
//         socket.on('admin:inviteExpert', (fromAdminId, toAdminId, ticketId) => {
//             const ticket = tickets.find(t => t.ticketId === ticketId);
//             if (ticket && ticket.adminId === fromAdminId) {
//                 // Transfer the ticket to the new admin
//                 ticket.adminId = toAdminId;

//                 // Notify both the new admin and the user
//                 io.to(toAdminId).emit('admin:loadChat', ticket.messages);
//                 io.to(ticket.userId).emit('user:receiveMessage', { adminId: toAdminId, message: "Another expert admin is joining your chat." });
//                 io.to(fromAdminId).emit('admin:status', { available: true });  // Make original admin available again
//             }
//         });

//         // Admin Leaves Chat (Disconnect)
//         socket.on('disconnect', () => {
//             const adminIndex = availableAdmins.indexOf(socket.id);
//             if (adminIndex > -1) availableAdmins.splice(adminIndex, 1);

//             // Remove any user waiting for this admin
//             userQueue = userQueue.filter(user => user.userId !== socket.id);
//         });
//     });
// };


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
            
            // Add admin to available list if not already there
            if (!availableAdmins.includes(adminId)) {
                availableAdmins.push(adminId);
            }
            
            io.to(adminId).emit('admin:status', { available: true });

            // Send list of active tickets to admin on login
            const adminTickets = tickets.filter(ticket => ticket.status === 'active');
            io.to(adminId).emit('admin:ticketList', adminTickets);

            // If there are any users in the queue, assign them to this admin
            if (userQueue.length > 0) {
                const nextUser = userQueue.shift();
                const ticketId = `ticket_${Date.now()}`;  // Generate a unique ticket ID
                
                const newTicket = {
                    ticketId,
                    userId: nextUser.userId,
                    adminId,
                    status: 'active',
                    createdAt: new Date(),
                    messages: [{ 
                        sender: 'user', 
                        userId: nextUser.userId,
                        message: nextUser.message,
                        timestamp: new Date()
                    }]  // Include the user's initial message
                };
                
                tickets.push(newTicket);
                
                io.to(adminId).emit('admin:newChat', newTicket);
                io.to(nextUser.userId).emit('user:connected', { 
                    ticketId, 
                    adminId, 
                    message: "An admin is available to help you!" 
                });
            }
        });

        // User Creates New Ticket
        socket.on('user:createTicket', (data) => {
            const { userId, message, category } = data; // Added category for ticket type
            console.log(`User ${userId} created ticket: ${message}`);

            // Add to queue with initial message
            userQueue.push({ userId, message, category, timestamp: new Date() });
            
            // Notify user their ticket is in queue
            io.to(userId).emit('user:ticketStatus', { 
                status: 'queued', 
                position: userQueue.length,
                message: "Your request has been received. An admin will connect with you shortly." 
            });

            // Notify all available admins of new ticket in queue
            io.emit('admin:queueUpdate', { queueLength: userQueue.length });
            
            // If there are available admins, try to assign this user
            processQueue();
        });

        // User Sends Message in Existing Ticket
        socket.on('user:sendMessage', (data) => {
            const { userId, ticketId, message } = data;
            console.log(`User ${userId} sent message in ticket ${ticketId}: ${message}`);

            // Find the ticket and add the message
            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket) {
                const newMessage = {
                    sender: 'user',
                    userId,
                    message,
                    timestamp: new Date()
                };
                
                ticket.messages.push(newMessage);
                
                // Send message to assigned admin
                io.to(ticket.adminId).emit('admin:receiveMessage', {
                    ticketId,
                    userId,
                    message: newMessage
                });
            } else {
                // Ticket not found, create a new one
                socket.emit('user:error', { 
                    message: "Your session has expired. Please create a new ticket." 
                });
            }
        });

        // Admin Views a Ticket
        socket.on('admin:viewTicket', (data) => {
            const { adminId, ticketId } = data;
            console.log(`Admin ${adminId} viewing ticket ${ticketId}`);

            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket) {
                // Send the complete ticket data with chat history to admin
                io.to(adminId).emit('admin:ticketData', ticket);
            } else {
                io.to(adminId).emit('admin:error', { 
                    message: "Ticket not found" 
                });
            }
        });

        // Admin Sends Message to User
        socket.on('admin:sendMessage', (data) => {
            const { adminId, ticketId, message } = data;
            console.log(`Admin ${adminId} sent message in ticket ${ticketId}: ${message}`);

            // Find the ticket and add the admin's message to the history
            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket) {
                const newMessage = {
                    sender: 'admin',
                    adminId,
                    message,
                    timestamp: new Date()
                };
                
                ticket.messages.push(newMessage);
                
                // Send to user
                io.to(ticket.userId).emit('user:receiveMessage', {
                    ticketId,
                    adminId,
                    message: newMessage
                });
            } else {
                io.to(adminId).emit('admin:error', { 
                    message: "Ticket not found" 
                });
            }
        });

        // Admin Toggles Availability
        socket.on('admin:toggleAvailability', (data) => {
            const { adminId, isAvailable } = data;
            
            if (isAvailable) {
                if (!availableAdmins.includes(adminId)) {
                    availableAdmins.push(adminId);
                }
                io.to(adminId).emit('admin:status', { available: true });
                
                // Process queue if there are waiting users
                processQueue();
            } else {
                const index = availableAdmins.indexOf(adminId);
                if (index > -1) {
                    availableAdmins.splice(index, 1);
                }
                io.to(adminId).emit('admin:status', { available: false });
            }
        });

        // Admin Transfers Ticket to Another Admin
        socket.on('admin:transferTicket', (data) => {
            const { fromAdminId, toAdminId, ticketId, reason } = data;
            console.log(`Admin ${fromAdminId} transferring ticket ${ticketId} to admin ${toAdminId}`);

            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket && ticket.adminId === fromAdminId) {
                // Record the transfer in chat history
                ticket.messages.push({
                    sender: 'system',
                    message: `Ticket transferred from admin ${fromAdminId} to admin ${toAdminId}${reason ? ': ' + reason : ''}`,
                    timestamp: new Date()
                });
                
                // Update the ticket with new admin
                ticket.adminId = toAdminId;
                ticket.transferredAt = new Date();
                ticket.transferReason = reason || 'Not specified';
                
                // Notify both admins
                io.to(toAdminId).emit('admin:ticketTransferred', ticket);
                io.to(fromAdminId).emit('admin:ticketTransferComplete', { ticketId });
                
                // Notify the user
                io.to(ticket.userId).emit('user:adminChanged', { 
                    ticketId,
                    message: "Your conversation has been transferred to another specialist who can better assist you."
                });
            } else {
                io.to(fromAdminId).emit('admin:error', { 
                    message: "Ticket transfer failed. Ticket not found or you're not assigned to this ticket." 
                });
            }
        });

        // Admin Gets List of Available Admins for Transfer
        socket.on('admin:getAvailableAdmins', (adminId) => {
            // Filter out the requesting admin
            const otherAdmins = availableAdmins.filter(id => id !== adminId);
            io.to(adminId).emit('admin:availableAdminsList', otherAdmins);
        });

        // Admin Closes Ticket
        socket.on('admin:closeTicket', (data) => {
            const { adminId, ticketId, resolution } = data;
            console.log(`Admin ${adminId} closing ticket ${ticketId}`);

            const ticket = tickets.find(t => t.ticketId === ticketId);
            if (ticket && ticket.adminId === adminId) {
                // Update ticket status
                ticket.status = 'closed';
                ticket.closedAt = new Date();
                ticket.resolution = resolution || 'Resolved';
                
                // Add closing message to history
                ticket.messages.push({
                    sender: 'system',
                    message: `Ticket closed: ${ticket.resolution}`,
                    timestamp: new Date()
                });
                
                // Notify user
                io.to(ticket.userId).emit('user:ticketClosed', {
                    ticketId,
                    message: "Your ticket has been resolved. Thank you for chatting with us!"
                });
                
                // Make admin available again
                if (!availableAdmins.includes(adminId)) {
                    availableAdmins.push(adminId);
                }
                
                // Process queue for next user
                processQueue();
            } else {
                io.to(adminId).emit('admin:error', { 
                    message: "Failed to close ticket. Ticket not found or you're not assigned to it." 
                });
            }
        });

        // Disconnect Handler
        socket.on('disconnect', () => {
            console.log('User or admin disconnected:', socket.id);
            
            // If an admin disconnects, remove from available list
            const adminIndex = availableAdmins.indexOf(socket.id);
            if (adminIndex > -1) {
                availableAdmins.splice(adminIndex, 1);
            }
            
            // Handle any active tickets for this admin
            const adminTickets = tickets.filter(t => t.adminId === socket.id && t.status === 'active');
            adminTickets.forEach(ticket => {
                // Mark ticket as requiring reassignment
                ticket.status = 'needs_reassignment';
                ticket.messages.push({
                    sender: 'system',
                    message: 'Admin disconnected. Waiting for new admin assignment.',
                    timestamp: new Date()
                });
                
                // Notify user
                io.to(ticket.userId).emit('user:adminDisconnected', {
                    ticketId: ticket.ticketId,
                    message: "The admin has been disconnected. We'll connect you with a new specialist shortly."
                });
                
                // Add user back to front of queue
                userQueue.unshift({
                    userId: ticket.userId,
                    message: "Previous admin disconnected - high priority reassignment",
                    previousTicketId: ticket.ticketId,
                    priority: 'high'
                });
            });
            
            // Process queue to reassign if possible
            processQueue();
        });
        
        // Helper function to process the user queue
        function processQueue() {
            // If there are both users waiting and admins available
            if (userQueue.length > 0 && availableAdmins.length > 0) {
                const nextUser = userQueue.shift();
                const adminId = availableAdmins.shift(); // Remove admin from available list while handling ticket
                
                let ticketId;
                let newTicket;
                
                // Check if this is a reassignment of existing ticket
                if (nextUser.previousTicketId) {
                    // Find the existing ticket
                    const existingTicket = tickets.find(t => t.ticketId === nextUser.previousTicketId);
                    if (existingTicket) {
                        existingTicket.adminId = adminId;
                        existingTicket.status = 'active';
                        existingTicket.reassignedAt = new Date();
                        
                        existingTicket.messages.push({
                            sender: 'system',
                            message: 'Ticket reassigned to new admin',
                            timestamp: new Date()
                        });
                        
                        ticketId = existingTicket.ticketId;
                        newTicket = existingTicket;
                    }
                }
                
                // If not a reassignment or existing ticket not found, create new one
                if (!newTicket) {
                    ticketId = `ticket_${Date.now()}`;
                    
                    newTicket = {
                        ticketId,
                        userId: nextUser.userId,
                        adminId,
                        status: 'active',
                        category: nextUser.category || 'general',
                        createdAt: new Date(),
                        messages: [{
                            sender: 'user',
                            userId: nextUser.userId,
                            message: nextUser.message,
                            timestamp: new Date()
                        }]
                    };
                    
                    tickets.push(newTicket);
                }
                
                // Notify admin of new assignment
                io.to(adminId).emit('admin:newChat', newTicket);
                
                // Notify user they've been connected
                io.to(nextUser.userId).emit('user:connected', {
                    ticketId,
                    adminId,
                    message: "An admin is now available to help you!"
                });
                
                // Update queue status for waiting users
                updateQueuePositions();
            }
        }
        
        // Helper function to update queue positions for waiting users
        function updateQueuePositions() {
            userQueue.forEach((user, index) => {
                io.to(user.userId).emit('user:queueUpdate', {
                    position: index + 1,
                    estimatedWaitTime: (index + 1) * 2 // Simple estimation: 2 minutes per person in queue
                });
            });
        }
    });
};