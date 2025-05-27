
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import MessagePanel from '@/components/messaging/MessagePanel';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { getContactsFromConversations, Contact } from '@/services/messageService';
import { useToast } from '@/hooks/use-toast';

const MessagingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const recipientId = searchParams.get('recipient');
  const recipientName = searchParams.get('name');

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const fetchedContacts = await getContactsFromConversations(user.id, user.role);
        
        if (recipientId && recipientName && !fetchedContacts.some(c => c.id === recipientId)) {
          // If a recipient was specified in the URL but not in our contacts,
          // add them to our contacts list with required avatar property
          fetchedContacts.push({
            id: recipientId,
            name: recipientName,
            role: user.role === 'school' ? 'supplier' : 'school',
            avatar: user.role === 'school' ? '🏢' : '🏫'
          });
        }
        
        setContacts(fetchedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load your conversations. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContacts();
  }, [user, recipientId, recipientName, toast]);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">Please login to access your messages</p>
              <Button onClick={() => navigate('/login')}>
                Login Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Messaging</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <MessagePanel 
                recipientId={recipientId || undefined} 
                recipientName={recipientName || undefined}
                contacts={contacts}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MessagingPage;
