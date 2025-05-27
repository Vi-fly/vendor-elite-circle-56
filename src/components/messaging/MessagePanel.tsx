import { useAuth } from '@/components/auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Contact,
  createConversation,
  getContactsFromConversations,
  getMessagesByConversationId,
  markMessagesAsRead,
  Message,
  sendMessage
} from '@/services/messageService';
import { Loader2, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface MessagePanelProps {
  recipientId?: string;
  recipientName?: string;
  contacts?: Contact[];
}

const MessagePanel: React.FC<MessagePanelProps> = ({ 
  recipientId: propRecipientId, 
  recipientName: propRecipientName,
  contacts: initialContacts
}) => {
  const [searchParams] = useSearchParams();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts || []);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messageListRef = useRef<HTMLDivElement>(null);

  // Extract URL parameters
  const urlRecipientId = searchParams.get('recipient');
  const urlRecipientName = searchParams.get('recipientName');
  const urlRecipientType = searchParams.get('recipientType');

  // Determine final recipient values
  const finalRecipientId = propRecipientId || urlRecipientId;
  const finalRecipientName = propRecipientName || urlRecipientName;

  // Fetch supplier details if we have an ID but no name
  const fetchSupplierDetails = async (supplierId: string) => {
    try {
      const { data: supplier, error } = await supabase
        .from('supplier_applications')
        .select('org_name, contact_name')
        .eq('id', supplierId)
        .single();

      if (error) {
        console.error('Error fetching supplier details:', error);
        return null;
      }

      return supplier;
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      return null;
    }
  };

  // Fetch contacts and initialize conversation
  useEffect(() => {
    const initializeMessaging = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        let recipientId = finalRecipientId;
        let recipientName = finalRecipientName;

        // If we have a recipient ID but no name, fetch the supplier details
        if (recipientId && !recipientName && urlRecipientType === 'supplier') {
          const supplierDetails = await fetchSupplierDetails(recipientId);
          if (supplierDetails) {
            recipientName = supplierDetails.org_name;
          }
        }

        // If we have initial recipient info, create a contact for them
        if (recipientId && recipientName) {
          const recipientContact: Contact = {
            id: recipientId,
            name: recipientName,
            role: urlRecipientType || 'supplier',
            avatar: recipientName.charAt(0).toUpperCase()
          };

          // Check if this contact already exists in the contacts list
          const existingContact = contacts.find(c => c.id === recipientId);
          if (!existingContact) {
            setContacts(prev => [recipientContact, ...prev]);
          }
          
          setSelectedContact(recipientId);
          setSelectedContactName(recipientName);
        }

        // Fetch existing contacts if we don't have initial contacts
        if (!initialContacts || initialContacts.length === 0) {
          const fetchedContacts = await getContactsFromConversations(user.id, user.role);
          
          // If we have a specific recipient, make sure they're included
          if (recipientId && recipientName) {
            const recipientContact: Contact = {
              id: recipientId,
              name: recipientName,
              role: urlRecipientType || 'supplier',
              avatar: recipientName.charAt(0).toUpperCase()
            };

            const contactExists = fetchedContacts.some(c => c.id === recipientId);
            if (!contactExists) {
              setContacts([recipientContact, ...fetchedContacts]);
            } else {
              setContacts(fetchedContacts);
            }
          } else {
            setContacts(fetchedContacts);
            
            // Select first contact if no specific recipient
            if (fetchedContacts.length > 0 && !recipientId) {
              setSelectedContact(fetchedContacts[0].id);
              setSelectedContactName(fetchedContacts[0].name);
            }
          }
        } else {
          setContacts(initialContacts);
          
          if (!recipientId && initialContacts.length > 0) {
            setSelectedContact(initialContacts[0].id);
            setSelectedContactName(initialContacts[0].name);
          }
        }
      } catch (error) {
        console.error('Error initializing messaging:', error);
        toast({
          title: "Error",
          description: "Failed to load messaging. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeMessaging();
  }, [user, finalRecipientId, finalRecipientName, urlRecipientType, initialContacts, toast]);

  // Handle conversation and messages
  useEffect(() => {
    const setupConversation = async () => {
      if (!user || !selectedContact) return;
      
      try {
        setIsLoading(true);
        
        // Create or get conversation
        const schoolId = user.role === 'school' ? user.id : selectedContact;
        const supplierId = user.role === 'supplier' ? user.id : selectedContact;
        
        const conversation = await createConversation(schoolId, supplierId);
        
        if (conversation) {
          setCurrentConversationId(conversation.id);
          
          // Fetch messages for this conversation
          const fetchedMessages = await getMessagesByConversationId(conversation.id);
          setMessages(fetchedMessages);
          
          // Mark messages as read
          await markMessagesAsRead(conversation.id, user.id);
        }
      } catch (error) {
        console.error('Error setting up conversation:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    setupConversation();
  }, [user, selectedContact, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || !selectedContact || !currentConversationId || isSending) {
      return;
    }
    
    try {
      setIsSending(true);
      
      const recipientRole = contacts.find(c => c.id === selectedContact)?.role || 
                          (user.role === 'school' ? 'supplier' : 'school');
      
      const newMessage = await sendMessage(
        currentConversationId,
        user.id,
        user.role,
        selectedContact,
        recipientRole,
        messageText
      );
      
      if (newMessage) {
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleContactClick = (contactId: string) => {
    setSelectedContact(contactId);
    const contactName = contacts.find(c => c.id === contactId)?.name || null;
    setSelectedContactName(contactName);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-[450px]">
      {/* Contacts Sidebar */}
      <div className="w-1/4 border-r bg-gray-50">
        <ScrollArea className="h-full">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-2">Contacts</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : contacts && contacts.length > 0 ? (
              <ul>
                {contacts.map((contact) => (
                  <li
                    key={contact.id}
                    className={`flex items-center space-x-3 py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer ${selectedContact === contact.id ? 'bg-gray-100' : ''}`}
                    onClick={() => handleContactClick(contact.id)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://avatar.vercel.sh/${contact.name}.png`} alt={contact.name} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {contact.role}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No contacts available.</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 bg-white">
          <div className="flex items-center gap-3">
            {selectedContactName && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${selectedContactName}.png`} alt={selectedContactName} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {getInitials(selectedContactName)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {selectedContactName || 'Select a Contact'}
              </h3>
              {selectedContactName && (
                <p className="text-sm text-gray-500">
                  {contacts.find(c => c.id === selectedContact)?.role || 'Contact'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50" ref={messageListRef}>
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                        message.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">No messages yet</p>
                    <p className="text-sm text-gray-400">
                      {selectedContactName ? `Start a conversation with ${selectedContactName}` : 'Select a contact to start messaging'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder={selectedContactName ? `Message ${selectedContactName}...` : "Select a contact to start messaging..."}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading || !selectedContact}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || isSending || !selectedContact || !messageText.trim()}
              size="sm"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel;