<template>
  <div class="messenger">
    <!-- Mobile conversation toggle -->
    <button 
      v-if="isMobile && selectedConversation"
      @click="showConversations = true"
      class="mobile-back-btn"
    >
      <i class="fas fa-arrow-left"></i>
    </button>

    <!-- Conversations List -->
    <div 
      class="conversations-sidebar"
      :class="{ 
        'mobile-hidden': isMobile && selectedConversation && !showConversations 
      }"
    >
      <div class="conversations-header">
        <h2>Messages</h2>
        <div class="conversation-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'active' }]" 
            @click="activeTab = 'active'"
          >
            Active
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'completed' }]" 
            @click="activeTab = 'completed'"
          >
            Completed
          </button>
        </div>
      </div>
      
      <div class="conversations-scroll">
        <div v-if="loadingConversations" class="loading-conversations">
          <div class="spinner"></div>
          <p>Loading conversations...</p>
        </div>
        
        <div v-else-if="conversationsError" class="error-container">
          <div class="error">{{ conversationsError }}</div>
          <button @click="loadConversations" class="retry-btn">Try Again</button>
        </div>
        
        <div v-else-if="filteredConversations.length === 0" class="empty-conversations">
          <div class="empty-illustration">
            <i class="fa fa-comments-o"></i>
          </div>
          <p>{{ activeTab === 'active' ? 'No active conversations' : 'No completed conversations' }}</p>
        </div>
        
        <div v-else class="conversations-items">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            :class="['conversation-item', { active: selectedConversation?.id === conversation.id }]"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-avatar">
              <div class="avatar" v-if="conversation.otherUser.profilePicture">
                <img :src="getProfilePicUrl(conversation.otherUser.profilePicture)" :alt="conversation.otherUser.firstName">
              </div>
              <div class="avatar placeholder" v-else>
                {{ getInitials(conversation.otherUser) }}
              </div>
            </div>
            
            <div class="conversation-details">
              <div class="conversation-header">
                <h4>{{ `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}` }}</h4>
                <span class="time">{{ formatTime(conversation.lastMessageTime) }}</span>
              </div>
              
              <div class="conversation-preview">
                <p v-if="conversation.lastMessage">{{ conversation.lastMessage }}</p>
                <p v-else-if="conversation.lastMessageImageUrl">Sent an image</p>
                <p v-else class="no-message">No messages yet</p>
                
                <div v-if="conversation.unreadCount > 0" class="unread-badge">
                  {{ conversation.unreadCount }}
                </div>
              </div>
              
              <div v-if="conversation.booking" class="booking-tag" :class="conversation.booking.status.toLowerCase()">
                {{ conversation.booking.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div 
      class="chat-main"
      :class="{ 
        'mobile-hidden': isMobile && showConversations,
        'no-conversation': !selectedConversation
      }"
    >
      <template v-if="selectedConversation">
    <!-- Chat header -->
    <div class="chat-header">
      <div class="user-info" v-if="recipient">
        <div class="avatar" v-if="recipient.profilePicture">
          <img :src="getProfilePicUrl(recipient.profilePicture)" :alt="recipient.firstName">
        </div>
        <div class="avatar placeholder" v-else>
          {{ getInitials(recipient) }}
        </div>
        <div class="user-details">
          <h3>{{ `${recipient.firstName} ${recipient.lastName}` }}</h3>
          <div class="typing-indicator" v-if="isTyping">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span>typing</span>
          </div>
        </div>
      </div>
      <div class="loading-info" v-else>
        <div class="loading-placeholder"></div>
      </div>
      
      <!-- Show booking info if booking exists -->
      <div v-if="selectedConversation?.booking" class="booking-info">
        <div class="booking-status" :class="selectedConversation.booking.status.toLowerCase()">
          {{ selectedConversation.booking.status }}
        </div>
        <div class="booking-title">
          {{ selectedConversation.booking.title || 'Service Booking' }}
        </div>
      </div>
    </div>

    <!-- Messages area -->
        <div class="messages-scroll" ref="messagesContainer">
      <div v-if="loading" class="loading-messages">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <div class="error">{{ error }}</div>
        <button @click="loadMessages" class="retry-btn">Try Again</button>
      </div>
      
      <div v-else-if="messages.length === 0" class="empty-messages">
        <div class="empty-illustration">
          <i class="fa fa-comments-o"></i>
        </div>
        <p>No messages yet. Start the conversation!</p>
      </div>

      <div v-else class="messages-list">
        <div 
          v-for="(message, index) in messages" 
          :key="message.id" 
          :class="[
            'message-item', 
            message.isSystemMessage ? 'system-message' : 
              (message.sender.id === currentUserId ? 'outgoing' : 'incoming')
          ]"
        >
          <!-- Date separator -->
          <div v-if="shouldShowDateSeparator(message, index)" class="date-separator">
            <span>{{ formatDateSeparator(message.createdAt) }}</span>
          </div>
          
          <!-- Message bubble -->
          <div class="message-bubble">
            <div class="message-content">
              <p v-if="message.content">{{ message.content }}</p>
              <div v-if="message.imageUrl" class="message-image">
                <img :src="getFileUrl(message.imageUrl)" @click="openImagePreview(message.imageUrl)" alt="Attached image">
              </div>
            </div>
            <div v-if="!message.isSystemMessage" class="message-time">
              {{ formatTime(message.createdAt) }}
              <span v-if="message.sender.id === currentUserId" class="read-status">
                <i class="fa fa-check" :class="{ 'read': message.isRead }"></i>
              </span>
            </div>
          </div>
        </div>
        
        <!-- Scroll to bottom button -->
        <button 
          v-if="showScrollButton"
          @click="scrollToBottom" 
          class="scroll-bottom-btn"
        >
          <i class="fa fa-arrow-down"></i>
        </button>
      </div>
    </div>

    <!-- Input area -->
        <div class="chat-footer">
      <div v-if="imagePreviewUrl" class="image-preview">
        <img :src="imagePreviewUrl" alt="Selected image">
        <button @click="removeImagePreview" class="remove-image-btn">
          <i class="fa fa-times"></i>
        </button>
      </div>
      
      <!-- Show message that conversation is closed -->
      <div v-if="!conversationActive" class="conversation-closed-banner">
        <i class="fa fa-lock"></i>
        <p>This conversation has been closed because the service booking is completed.</p>
      </div>
      
      <!-- Regular input actions -->
      <div v-else class="input-actions">
        <label for="image-upload" class="image-upload-btn">
          <i class="fa fa-image"></i>
        </label>
        <input 
          id="image-upload" 
          type="file"
          accept="image/*"
          @change="handleImageSelect"
          style="display: none"
        >
        
        <textarea
          v-model="messageText"
          @input="handleTyping"
          @keydown.enter.exact.prevent="sendMessage"
          placeholder="Type your message..."
          class="message-input"
        ></textarea>
        
        <button 
          @click="sendMessage" 
          :disabled="!canSendMessage"
          class="send-btn"
        >
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
      
      <div v-if="sendingError" class="send-error">
        {{ sendingError }}
        <button @click="sendMessage" class="retry-send">Retry</button>
      </div>
    </div>
      </template>

      <!-- Show placeholder when no conversation is selected -->
      <div v-else class="no-chat-placeholder">
        <div class="empty-illustration">
          <i class="fa fa-comments-o"></i>
        </div>
        <h3>Select a conversation to start messaging</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue';
import { io } from 'socket.io-client';
import { FILE_SERVER_URL, chatService } from '@/services/apiService';

export default {
  name: 'MessageChat',
  setup() {
    // State variables
    const conversations = ref([]);
    const selectedConversation = ref(null);
    const loadingConversations = ref(true);
    const conversationsError = ref('');
    const messages = ref([]);
    const messageText = ref('');
    const loading = ref(true);
    const error = ref('');
    const recipient = ref(null);
    const currentUserId = ref('');
    const socket = ref(null);
    const isConnected = ref(false);
    const isTyping = ref(false);
    const typingTimeout = ref(null);
    const userTypingTimeout = ref(null);
    const messagesContainer = ref(null);
    const showScrollButton = ref(false);
    const imageFile = ref(null);
    const imagePreviewUrl = ref('');
    const sendingError = ref('');
    const previewImage = ref(null);
    const conversationActive = ref(true);
    const activeTab = ref('active');
    
    // Mobile responsive state
    const isMobile = ref(window.innerWidth < 768);
    const showConversations = ref(true);
    
    // Constants
    const API_BASE_URL = FILE_SERVER_URL;
    const SOCKET_URL = API_BASE_URL;
    const TYPING_TIMEOUT = 2000; // ms
    
    // Debug mode
    const DEBUG = true;
    const logDebug = (message, ...args) => {
      if (DEBUG) {
        console.log(`[CHAT DEBUG] ${message}`, ...args);
      }
    };
    
    // Check if we can send a message
    const canSendMessage = computed(() => {
      return conversationActive.value && 
        (messageText.value.trim().length > 0 || imageFile.value) && 
        !loading.value && 
        selectedConversation.value;
    });
    
    // Load conversations
    const loadConversations = async () => {
      try {
        loadingConversations.value = true;
        conversationsError.value = '';
        
        const token = localStorage.getItem('token');
        const response = await chatService.getConversations(token);
        
        if (response.success) {
          logDebug(`Loaded ${response.data?.length} conversations`);
          conversations.value = response.data || [];
          
          // If we have a selected conversation, update its reference
          if (selectedConversation.value) {
            const updatedConversation = conversations.value.find(
              c => c.id === selectedConversation.value.id
            );
            if (updatedConversation) {
              selectedConversation.value = updatedConversation;
              recipient.value = updatedConversation.otherUser;
              conversationActive.value = updatedConversation.isActive !== false;
            }
          }
        } else {
          throw new Error(response.message || 'Failed to load conversations');
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
        conversationsError.value = 'Unable to load conversations. Please try again.';
      } finally {
        loadingConversations.value = false;
      }
    };
    
    // Select conversation
    const selectConversation = async (conversation) => {
      logDebug(`Selecting conversation: ${conversation.id}`);
      
      // First leave previous conversation room if there was one
      if (socket.value && isConnected.value && selectedConversation.value) {
        logDebug(`Leaving room: ${selectedConversation.value.id}`);
        socket.value.emit('leave-conversation', selectedConversation.value.id);
      }
      
      // Set the selected conversation
      selectedConversation.value = conversation;
      recipient.value = conversation.otherUser;
      
      // Join the conversation room in socket
      if (socket.value && isConnected.value) {
        logDebug(`Joining room: ${conversation.id}`);
        socket.value.emit('join-conversation', conversation.id);
      }
      
      // Clear messages array before loading new ones
      messages.value = [];
      loading.value = true;
      
      // Load messages for this conversation
      await loadMessages();
      
      // Mark messages as read
      if (document.hasFocus()) {
        markMessagesAsRead();
      }

      // Handle mobile view
      if (isMobile.value) {
        showConversations.value = false;
      }
    };
    
    // Initialize socket connection
    const initializeSocket = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        error.value = 'Authentication required. Please log in again.';
        return;
      }
      
      // Get current user ID from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId.value = payload.id;
        logDebug(`Current user ID: ${currentUserId.value}`);
      } catch (err) {
        console.error('Error parsing token:', err);
        error.value = 'Invalid authentication token. Please log in again.';
        return;
      }
      
      // Connect to socket server
      logDebug(`Connecting to socket server: ${SOCKET_URL}`);
      
      // Disconnect any existing connection first
      if (socket.value) {
        logDebug('Closing existing socket connection');
        socket.value.disconnect();
      }
      
      // Create new socket connection
      socket.value = io(SOCKET_URL, {
        path: '/socket',
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      // Socket event listeners
      socket.value.on('connect', () => {
        logDebug(`Socket connected with ID: ${socket.value.id}`);
        isConnected.value = true;
        
        // If conversation is already selected, join the room
        if (selectedConversation.value) {
          logDebug(`Rejoining room after connect: ${selectedConversation.value.id}`);
          socket.value.emit('join-conversation', selectedConversation.value.id);
        }
        
        // Load initial conversations
        loadConversations();
      });
      
      socket.value.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        error.value = `Failed to connect to chat server: ${err.message}`;
        isConnected.value = false;
      });
      
      socket.value.on('disconnect', (reason) => {
        logDebug(`Socket disconnected: ${reason}`);
        isConnected.value = false;
      });
      
      socket.value.on('error', (data) => {
        console.error('Socket error event:', data);
        error.value = data.message || 'An error occurred with the chat connection';
      });
      
      // CORE MESSAGE HANDLING 
      socket.value.on('message', (data) => {
        logDebug('Direct message received:', data);
        processIncomingMessage(data);
      });
      
      // Handle message notifications
      socket.value.on('new-message-notification', (data) => {
        logDebug('Message notification received:', data);
        
        if (data && data.message) {
          const enrichedMessage = {
            ...data.message,
            conversationId: data.conversationId || data.message.conversationId
          };
          processIncomingMessage(enrichedMessage);
        } 
        else if (data && data.conversationId) {
          // If notification is for current conversation but no message object, reload messages
          if (selectedConversation.value && selectedConversation.value.id === data.conversationId) {
            logDebug('Notification for active conversation, reloading messages');
            loadMessages();
          }
          
          // Update conversation list if we have update data
          if (data.lastMessage || data.lastMessageTime) {
            updateConversationsList(data);
          }
        }
      });
      
      // Handle typing indicator
      socket.value.on('user-typing', (data) => {
        if (selectedConversation.value && data.conversationId === selectedConversation.value.id) {
          if (data.userId === recipient.value?.id) {
            isTyping.value = data.isTyping;
          
          // Clear existing timeout if there is one
          if (userTypingTimeout.value) {
            clearTimeout(userTypingTimeout.value);
          }
          
          // Set timeout to clear typing indicator
            if (data.isTyping) {
          userTypingTimeout.value = setTimeout(() => {
            isTyping.value = false;
          }, TYPING_TIMEOUT);
            }
          }
        }
      });
      
      // Handle read receipts
      socket.value.on('messages-read', (data) => {
        if (selectedConversation.value && data.conversationId === selectedConversation.value.id) {
          logDebug('Messages marked as read in conversation', data.conversationId);
          
          // Update read status for sent messages
          messages.value = messages.value.map(message => {
            if (message.sender.id === currentUserId.value) {
              return { ...message, isRead: true };
            }
            return message;
          });
        }
      });
    };
    
    // Process incoming message
    const processIncomingMessage = (message) => {
      if (!message) {
        logDebug('Null message received');
        return;
      }
      
      // Extract conversationId from message or parent object
      const conversationId = message.conversationId || (message.message && message.message.conversationId);
      
      logDebug('Processing incoming message:', message);
      logDebug('Current conversation:', selectedConversation.value?.id);
      
      // Get the actual message object from notification if needed
      const actualMessage = message.message || message;
      
      // Always update conversations list 
      if (actualMessage.conversationId || conversationId) {
        updateConversationsList({
          ...actualMessage,
          conversationId: actualMessage.conversationId || conversationId
        });
      }
      
      // Check if message belongs to active conversation - this is the key check that was failing
      const activeConversationId = selectedConversation.value?.id;
      const messageForActiveConversation = 
        (actualMessage.conversationId && actualMessage.conversationId === activeConversationId) ||
        (conversationId === activeConversationId);
      
      logDebug(`Message for active conversation? ${messageForActiveConversation}`);
      
      if (messageForActiveConversation) {
        logDebug('Adding message to active conversation UI');
        
        // Add message if it's not already in the list
        if (!messages.value.some(m => m.id === actualMessage.id)) {
          // Create a new array to ensure Vue reactivity
          messages.value = [...messages.value, actualMessage];
          
          // Schedule scroll after DOM update
          nextTick(() => {
            if (isNearBottom()) {
              scrollToBottom();
            }
          });
          
          // Mark as read if window is focused
          if (document.hasFocus() && actualMessage.sender.id !== currentUserId.value) {
            markMessagesAsRead();
          }
        }
      }
    };
    
    // Load messages for the selected conversation
    const loadMessages = async () => {
      if (!selectedConversation.value) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        logDebug(`Loading messages for conversation: ${selectedConversation.value.id}`);
        const token = localStorage.getItem('token');
        const response = await chatService.getConversationMessages(selectedConversation.value.id, token);
        
        if (response.success) {
          // Update messages and conversation status
          if (response.data.messages) {
            messages.value = [...response.data.messages];
            logDebug(`Loaded ${messages.value.length} messages`);
            
            // Update conversation active status
            if (response.data.conversationStatus) {
              conversationActive.value = response.data.conversationStatus.isActive !== false;
              logDebug(`Conversation active status: ${conversationActive.value}`);
              
              // Add system message for completed booking
              if (!conversationActive.value && messages.value.length > 0) {
                // Add system message if not already present
                const hasSystemMessage = messages.value.some(m => 
                  m.content === "This conversation has been closed because the service booking has been completed."
                );
                
                if (!hasSystemMessage) {
                  messages.value.push({
                    id: 'system-' + Date.now(),
                    content: "This conversation has been closed because the service booking has been completed.",
                    createdAt: new Date(),
                    isRead: true,
                    isSystemMessage: true,
                    sender: { id: 'system' }
                  });
                }
              }
            }
          } else {
            // Fallback for old API versions
            messages.value = [...(response.data || [])];
            logDebug(`Loaded ${messages.value.length} messages (legacy format)`);
          }
          
          // Mark messages as read & scroll to bottom
          nextTick(() => {
            scrollToBottom();
            if (document.hasFocus()) {
            markMessagesAsRead();
            }
          });
        } else {
          console.error('Error loading messages:', response.message);
          error.value = response.message || 'Failed to load messages';
        }
      } catch (err) {
        console.error('Exception loading messages:', err);
        error.value = 'Unable to load messages. Please try again later.';
      } finally {
        loading.value = false;
      }
    };
    
    // Update conversations list with a new message
    const updateConversationsList = (message) => {
      if (!message || !message.conversationId) {
        logDebug('Invalid message for conversation update:', message);
        return;
      }
      
      logDebug(`Updating conversations list for conversation: ${message.conversationId}`);
      
      // Find the conversation to update
      const index = conversations.value.findIndex(c => c.id === message.conversationId);
      if (index === -1) {
        logDebug('Conversation not found in list, reloading conversations');
        loadConversations();
        return;
      }
      
      // Create a new conversation object with updated properties
      const updatedConversation = { ...conversations.value[index] };
      
      // Update conversation properties if available 
      if (message.content !== undefined) updatedConversation.lastMessage = message.content;
      if (message.createdAt) updatedConversation.lastMessageTime = message.createdAt;
      if (message.imageUrl) updatedConversation.lastMessageImageUrl = message.imageUrl;
      
      // Update unread count if message is from the other person
      if (message.sender && message.sender.id !== currentUserId.value) {
        // Only increment if not in the active conversation or window not focused
        if (!selectedConversation.value || 
            selectedConversation.value.id !== message.conversationId || 
            !document.hasFocus()) {
          updatedConversation.unreadCount = (updatedConversation.unreadCount || 0) + 1;
          logDebug(`Incremented unread count for conversation: ${updatedConversation.id}`);
        }
      }
      
      // Create a new array for reactivity
      const updatedConversations = [...conversations.value];
      
      // Remove the old conversation
      updatedConversations.splice(index, 1);
      
      // Add the updated one at the beginning (most recent)
      updatedConversations.unshift(updatedConversation);
      
      // Update the conversations list
      conversations.value = updatedConversations;
      
      // If this is the active conversation, update the reference
      if (selectedConversation.value && selectedConversation.value.id === updatedConversation.id) {
        logDebug('Updating selected conversation reference');
        selectedConversation.value = updatedConversation;
      }
    };
    
    // Send message function
    const sendMessage = async () => {
      if (!canSendMessage.value) return;
      
      const content = messageText.value.trim();
      sendingError.value = '';
      
      // Upload image if available
      let imageUrl = null;
      if (imageFile.value) {
        try {
          const token = localStorage.getItem('token');
          const response = await chatService.uploadImage(imageFile.value, token);
          
          if (response.success && response.imageUrl) {
            imageUrl = response.imageUrl;
            logDebug('Image uploaded successfully:', imageUrl);
          } else {
            sendingError.value = 'Failed to upload image. ' + (response.message || '');
            return;
          }
        } catch (err) {
          console.error('Error uploading image:', err);
          sendingError.value = 'Error uploading image. Please try again.';
          return;
        }
      }
      
      // Create a temporary message to display immediately
      const tempMessage = {
        id: 'temp-' + Date.now(),
        conversationId: selectedConversation.value.id,
        content: content || '',
        imageUrl: imageUrl,
        createdAt: new Date(),
        isRead: false,
        sender: {
          id: currentUserId.value,
          firstName: 'You',
          lastName: '',
          profilePicture: null
        }
      };
      
      // Add temporary message to the UI immediately
      messages.value = [...messages.value, tempMessage];
      
      // Clear input immediately for better UX
      messageText.value = '';
      removeImagePreview();
      
      // Scroll to show the new message
      nextTick(() => scrollToBottom());
      
      // Send message through socket
      if (isConnected.value && socket.value) {
        logDebug('Sending message:', {
          conversationId: selectedConversation.value.id,
          content,
          imageUrl
        });
        
        socket.value.emit('new-message', {
          conversationId: selectedConversation.value.id,
          content,
          imageUrl
        });
        
        // Stop typing indicator
        if (typingTimeout.value) {
          clearTimeout(typingTimeout.value);
          typingTimeout.value = null;
          
          // Emit stop typing event
          socket.value.emit('typing', {
            conversationId: selectedConversation.value.id,
            isTyping: false
          });
        }
      } else {
        sendingError.value = 'Not connected to chat server. Please try again.';
      }
    };
    
    // Handle typing events
    const handleTyping = () => {
      if (!isConnected.value || !socket.value || !selectedConversation.value) return;
      
      // Send typing indicator
      socket.value.emit('typing', {
        conversationId: selectedConversation.value.id,
        isTyping: true
      });
      
      // Clear existing timeout
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value);
      }
      
      // Set timeout to stop typing indicator
      typingTimeout.value = setTimeout(() => {
        if (socket.value) {
          socket.value.emit('typing', {
            conversationId: selectedConversation.value.id,
            isTyping: false
          });
        }
        typingTimeout.value = null;
      }, TYPING_TIMEOUT);
    };
    
    // Mark messages as read
    const markMessagesAsRead = () => {
      if (!isConnected.value || !socket.value || !selectedConversation.value) {
        logDebug('Cannot mark as read - prerequisites not met');
        return;
      }
      
      // Only mark as read if we have unread messages from the other user
      const hasUnreadMessages = messages.value.some(
        message => !message.isRead && message.sender.id === recipient.value?.id
      );
      
      if (hasUnreadMessages) {
        logDebug('Marking messages as read');
        socket.value.emit('mark-read', {
          conversationId: selectedConversation.value.id
        });
        
        // Update local messages
        messages.value = messages.value.map(message => {
          if (message.sender.id === recipient.value?.id) {
            return { ...message, isRead: true };
          }
          return message;
        });
        
        // Update conversation unread count
        if (selectedConversation.value) {
          selectedConversation.value.unreadCount = 0;
          
          // Also update in the conversations list
          const index = conversations.value.findIndex(c => c.id === selectedConversation.value.id);
          if (index !== -1) {
            const updatedConversations = [...conversations.value];
            updatedConversations[index] = {
              ...updatedConversations[index],
              unreadCount: 0
            };
            conversations.value = updatedConversations;
          }
        }
      }
    };
    
    // Scroll to bottom of messages
    const scrollToBottom = () => {
      if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
          showScrollButton.value = false;
      }
    };
    
    // Check if we're near the bottom of the scroll
    const isNearBottom = () => {
      if (!messagesContainer.value) return true;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
      return scrollHeight - scrollTop - clientHeight < 100;
    };
    
    // Handle scroll events
    const handleScroll = () => {
      if (!messagesContainer.value) return;
      
      showScrollButton.value = !isNearBottom();
    };
    
    // Format time for messages (e.g., "3:45 PM")
    const formatTime = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    // Format date separator (e.g., "Today", "Yesterday", "June 15, 2023")
    const formatDateSeparator = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Format as "Today", "Yesterday", or date
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    };
    
    // Determine if we should show a date separator before this message
    const shouldShowDateSeparator = (message, index) => {
      // Always show for first message
      if (index === 0) return true;
      
      // Check if date is different from previous message
      const prevDate = new Date(messages.value[index - 1].createdAt).toDateString();
      const currDate = new Date(message.createdAt).toDateString();
      
      return prevDate !== currDate;
    };
    
    // Get user initials for avatar placeholder
    const getInitials = (user) => {
      if (!user) return '';
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
    };
    
    // Handle image selection
    const handleImageSelect = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        sendingError.value = 'Image is too large. Maximum size is 5MB.';
        event.target.value = '';
        return;
      }
      
      // Create preview URL
      imageFile.value = file;
      imagePreviewUrl.value = URL.createObjectURL(file);
      
      // Clear error if any
      sendingError.value = '';
    };
    
    // Remove image preview
    const removeImagePreview = () => {
      if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value);
      }
      imageFile.value = null;
      imagePreviewUrl.value = '';
    };
    
    // Get file URL for images
    const getFileUrl = (relativePath) => {
      if (!relativePath) return '';
      
      if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
      }
      
      return `${API_BASE_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
    };
    
    // Get profile picture URL
    const getProfilePicUrl = (relativePath) => {
      return getFileUrl(relativePath);
    };
    
    // Open image preview
    const openImagePreview = (imagePath) => {
      previewImage.value = imagePath;
    };
    
    // Close image preview
    const closeImagePreview = () => {
      previewImage.value = null;
    };
    
    // Handle window resize
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768;
      if (!isMobile.value) {
        showConversations.value = true;
      }
    };

    // Lifecycle hooks update
    onMounted(() => {
      initializeSocket();
      
      if (messagesContainer.value) {
        messagesContainer.value.addEventListener('scroll', handleScroll);
      }
      
      // Add focus event listener
      window.addEventListener('focus', () => {
        if (selectedConversation.value) {
          markMessagesAsRead();
        }
      });

      window.addEventListener('resize', handleResize);
    });
    
    onBeforeUnmount(() => {
      if (socket.value) {
        if (selectedConversation.value) {
          socket.value.emit('leave-conversation', selectedConversation.value.id);
        }
        socket.value.disconnect();
      }
      
      // Clear timers
      if (typingTimeout.value) clearTimeout(typingTimeout.value);
      if (userTypingTimeout.value) clearTimeout(userTypingTimeout.value);
      
      // Clear image URL if any
      if (imagePreviewUrl.value) {
        URL.revokeObjectURL(imagePreviewUrl.value);
      }
      
      // Remove event listeners
      if (messagesContainer.value) {
        messagesContainer.value.removeEventListener('scroll', handleScroll);
      }
      
      window.removeEventListener('focus', markMessagesAsRead);
      window.removeEventListener('resize', handleResize);
    });
    
    // Computed property to filter conversations based on active tab
    const filteredConversations = computed(() => {
      if (activeTab.value === 'active') {
        return conversations.value.filter(conv => conv.isActive !== false);
      } else {
        return conversations.value.filter(conv => conv.isActive === false);
      }
    });
    
    // Return functions and variables for template
    return {
      conversations,
      selectedConversation,
      loadingConversations,
      conversationsError,
      messages,
      messageText,
      loading,
      error,
      recipient,
      currentUserId,
      isTyping,
      messagesContainer,
      showScrollButton,
      imagePreviewUrl,
      sendingError,
      previewImage,
      canSendMessage,
      loadConversations,
      selectConversation,
      loadMessages,
      sendMessage,
      handleTyping,
      scrollToBottom,
      formatTime,
      formatDateSeparator,
      shouldShowDateSeparator,
      getInitials,
      handleImageSelect,
      removeImagePreview,
      getFileUrl,
      getProfilePicUrl,
      openImagePreview,
      closeImagePreview,
      isMobile,
      showConversations,
      conversationActive,
      activeTab,
      filteredConversations
    };
  }
};
</script>

<style scoped>
.messenger {
  display: flex;
  height: calc(100vh - 80px); /* Adjust height to account for header/navbar */
  max-height: calc(100vh - 80px);
  background-color: #f5f7fa;
  position: relative;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  margin: 20px;
  overflow: hidden;
}

/* Conversations List */
.conversations-sidebar {
  width: 350px;
  min-width: 350px;
  background-color: white;
  border-right: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
}

.conversations-header {
  padding: 20px;
  border-bottom: 1px solid #e1e4e8;
  flex-shrink: 0;
  background-color: #f8f9fa;
}

.conversations-header h2 {
  margin: 0 0 10px 0;
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: 600;
}

.conversations-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
}

.conversation-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f1f1f1;
  cursor: pointer;
  transition: all 0.2s;
}

.conversation-item:hover {
  background-color: #f8f9fa;
  transform: translateX(3px);
}

.conversation-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #3498db;
}

.conversation-avatar {
  margin-right: 15px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e1e4e8;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar.placeholder {
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #3498db, #2980b9);
  font-size: 1.2rem;
}

/* Chat Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background: linear-gradient(to bottom, #f5f7fa, #edf2f7);
}

.chat-header {
  padding: 15px 20px;
  background-color: white;
  border-bottom: 1px solid #e1e4e8;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-details h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item.outgoing {
  align-self: flex-end;
}

.message-item.incoming {
  align-self: flex-start;
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.message-item.outgoing .message-bubble {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-bottom-right-radius: 5px;
}

.message-item.incoming .message-bubble {
  background-color: white;
  border-bottom-left-radius: 5px;
}

.message-item.outgoing .message-bubble:hover {
  background: linear-gradient(135deg, #2980b9, #1c6391);
}

.message-item.incoming .message-bubble:hover {
  background-color: #f8f9fa;
}

.message-content {
  margin: 0;
}

.message-content p {
  margin: 0;
  line-height: 1.4;
}

.message-image {
  margin-top: 8px;
  max-width: 300px;
}

.message-image img {
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.message-image img:hover {
  transform: scale(1.02);
}

.message-time {
  font-size: 0.7rem;
  margin-top: 5px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.read-status i {
  font-size: 0.8rem;
}

.read-status i.read {
  color: #2ecc71;
}

.date-separator {
  width: 100%;
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.date-separator::before {
  content: '';
  display: block;
  height: 1px;
  background-color: #e1e4e8;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  z-index: 1;
}

.date-separator span {
  background-color: #f5f7fa;
  padding: 0 15px;
  font-size: 0.8rem;
  color: #7f8c8d;
  position: relative;
  z-index: 2;
  font-weight: 600;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chat-footer {
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #e1e4e8;
  flex-shrink: 0;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
}

.input-actions {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.image-upload-btn {
  padding: 10px;
  color: #3498db;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background-color: #f5f7fa;
}

.image-upload-btn:hover {
  background-color: #e3f2fd;
  transform: translateY(-2px);
}

.message-input {
  flex: 1;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 12px 18px;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
  font-size: 0.95rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.message-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.send-btn {
  padding: 12px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.send-btn:disabled {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Mobile styles */
.mobile-back-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 100;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #2c3e50;
  cursor: pointer;
  display: none;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.mobile-back-btn:hover {
  background-color: white;
}

@media (max-width: 767px) {
  .messenger {
    height: calc(100vh - 60px);
    max-height: calc(100vh - 60px);
    margin: 10px;
    border-radius: 8px;
  }

  .conversations-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 10;
    transition: transform 0.3s ease-in-out;
  }

  .mobile-hidden {
    transform: translateX(-100%);
  }

  .mobile-back-btn {
    display: block;
  }

  .chat-main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    transition: transform 0.3s ease-in-out;
  }

  .chat-main.mobile-hidden {
    transform: translateX(100%);
  }
  
  .message-item {
    max-width: 85%;
  }
}

/* Tab styling */
.conversation-tabs {
  display: flex;
  margin-top: 10px;
  border-bottom: 1px solid #e1e4e8;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 15px;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  color: #6c757d;
  font-weight: 500;
}

.tab-btn.active {
  border-bottom-color: #3498db;
  color: #3498db;
  font-weight: 600;
  background-color: rgba(52, 152, 219, 0.05);
}

.tab-btn:hover:not(.active) {
  background-color: #f8f9fa;
  color: #495057;
}

/* Loading and empty states */
.loading-conversations, 
.loading-messages,
.empty-conversations,
.empty-messages,
.no-chat-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #95a5a6;
  height: 100%;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #3498db;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-illustration {
  font-size: 3.5rem;
  margin-bottom: 15px;
  color: #bdc3c7;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* System message styling */
.message-item.system-message {
  align-self: center;
  max-width: 90%;
  margin: 15px 0;
}

.message-item.system-message .message-bubble {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  text-align: center;
}

/* Scrollbar styling */
.conversations-scroll::-webkit-scrollbar,
.messages-scroll::-webkit-scrollbar {
  width: 6px;
}

.conversations-scroll::-webkit-scrollbar-thumb,
.messages-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.conversations-scroll::-webkit-scrollbar-track,
.messages-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Scroll to bottom button */
.scroll-bottom-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #3498db;
  transition: all 0.2s;
  z-index: 5;
}

.scroll-bottom-btn:hover {
  background-color: #f1f1f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Booking related styling */
.booking-tag, .booking-status {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  transition: all 0.2s;
}

.booking-tag {
  margin-top: 5px;
}

.booking-info {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 15px;
  border-left: 1px solid #e1e4e8;
}

.booking-title {
  font-size: 13px;
  margin-top: 4px;
  color: #6c757d;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status colors with improved styling */
.booking-status.pending, .booking-tag.pending { 
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}

.booking-status.confirmed, .booking-tag.confirmed { 
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.booking-status.in_progress, .booking-tag.in_progress { 
  background-color: #cce5ff;
  color: #004085;
  border: 1px solid #b8daff;
}

.booking-status.completed, .booking-tag.completed { 
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.booking-status.cancelled, .booking-tag.cancelled { 
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Typing indicator animation */
.typing-indicator {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
  gap: 5px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #3498db;
  animation: typing-dot 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-dot {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Image preview styling */
.image-preview {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
  position: relative;
  border: 1px dashed #cbd5e0;
}

.image-preview img {
  height: 100px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

/* Conversation closed banner */
.conversation-closed-banner {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  animation: fadeIn 0.3s ease-in-out;
}

.conversation-closed-banner i {
  font-size: 1.2rem;
  margin-right: 10px;
}

.conversation-closed-banner p {
  margin: 0;
}
</style>
