import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupsTab from './GroupsTab';
import MessagesTab from './MessagesTab';
import StickersTab from './StickersTab';

const CommunityHub = ({ studentId }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-900/30 rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Student Community</h1>
        <p className="text-slate-400">Connect, chat, and share with fellow students.</p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 w-full md:w-auto">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="stickers">Stickers Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="mt-6">
          <GroupsTab studentId={studentId} />
        </TabsContent>
        
        <TabsContent value="messages" className="mt-6">
          <MessagesTab studentId={studentId} />
        </TabsContent>
        
        <TabsContent value="stickers" className="mt-6">
          <StickersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;