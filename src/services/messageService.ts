
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  sender_role: string;
  recipient_role: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  school_id: string;
  supplier_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string; // Changed from optional to required
}

export const getConversationsByUserId = async (userId: string, userRole: string): Promise<Conversation[]> => {
  try {
    if (userRole === 'school') {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('school_id', userId);
        
      if (error) throw error;
      return data || [];
    } else if (userRole === 'supplier') {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('supplier_id', userId);
        
      if (error) throw error;
      return data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

export const getMessagesByConversationId = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderRole: string,
  recipientId: string,
  recipientRole: string,
  content: string
): Promise<Message | null> => {
  try {
    // First, update the conversation's last_message_at
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', conversationId);
      
    if (updateError) throw updateError;
    
    // Then, insert the new message
    const newMessage = {
      id: uuidv4(),
      conversation_id: conversationId,
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      sender_role: senderRole,
      recipient_role: recipientRole,
      is_read: false,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const createConversation = async (
  schoolId: string,
  supplierId: string
): Promise<Conversation | null> => {
  try {
    // Check if a conversation already exists between these users
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('supplier_id', supplierId)
      .maybeSingle();
      
    if (fetchError) throw fetchError;
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create a new conversation if one doesn't exist
    const newConversation = {
      id: uuidv4(),
      school_id: schoolId,
      supplier_id: supplierId,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('conversations')
      .insert(newConversation)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const getContactsFromConversations = async (userId: string, userRole: string): Promise<Contact[]> => {
  try {
    let contacts: Contact[] = [];
    
    if (userRole === 'school') {
      // School users see supplier contacts
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          supplier_id,
          supplier_applications(org_name)
        `)
        .eq('school_id', userId);
        
      if (error) throw error;
      
      if (data) {
        contacts = data.map(item => ({
          id: item.supplier_id,
          name: item.supplier_applications?.[0]?.org_name || 'Unknown Supplier',
          role: 'supplier',
          avatar: '🏢' // Default avatar for suppliers
        }));
      }
    } else if (userRole === 'supplier') {
      // Supplier users see school contacts
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          school_id,
          school:profiles(name)
        `)
        .eq('supplier_id', userId);
        
      if (error) throw error;
      
      if (data) {
        contacts = data.map(item => {
          // Handle case where profiles might not exist or the structure is different than expected
          let name = 'School User';
          
          if (item.school && Array.isArray(item.school) && item.school.length > 0) {
            name = item.school[0].name || 'School User';
          }
          
          return {
            id: item.school_id,
            name,
            role: 'school',
            avatar: '🏫' // Default avatar for schools
          };
        });
      }
    }
    
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};
