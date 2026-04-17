import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Calculator, FileText, DollarSign } from 'lucide-react';
import { calculateLeadScore } from '@/lib/leadScoringService';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [filterTier, setFilterTier] = useState('All');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      // Custom Sort: Paid first, then by score DESC
      .order('payment_status', { ascending: true }) // 'paid' < 'pending' alphabetically? No, 'paid' starts with p. 'pending' starts with p.
      // Actually we want Paid first. 'paid' comes before 'pending' in asc sort.
      .order('score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching leads:', error);
    else setLeads(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    // Optimistic update
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      fetchLeads(); // Revert on error
    }
  };

  const handleBackfillAll = async () => {
    setRecalculating(true);
    let updatedCount = 0;
    try {
      const { data: allLeads, error } = await supabase.from('leads').select('*');
      if (error) throw error;

      for (const lead of allLeads) {
        const result = await calculateLeadScore(lead);
        if (lead.score !== result.score || lead.tier !== result.tier) {
          await supabase
            .from('leads')
            .update({
              score: result.score,
              tier: result.tier,
              scored_at: result.scored_at
            })
            .eq('id', lead.id);
          updatedCount++;
        }
      }
      await fetchLeads();
      toast({ title: "Backfill Complete", description: `Updated ${updatedCount} leads.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Backfill Failed", description: error.message });
    } finally {
      setRecalculating(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-500/10 text-blue-500';
      case 'Contacted': return 'bg-yellow-500/10 text-yellow-500';
      case 'Converted': return 'bg-green-500/10 text-green-500';
      case 'Rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'A': return <Badge className="bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30">Tier A</Badge>;
      case 'B': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30">Tier B</Badge>;
      case 'C': return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/50 hover:bg-slate-500/30">Tier C</Badge>;
      default: return <Badge variant="outline" className="text-slate-500">N/A</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    if (status === 'paid') return <Badge className="bg-emerald-600 hover:bg-emerald-700 border-none">Paid</Badge>;
    return <Badge variant="outline" className="text-slate-500 border-slate-700">Pending</Badge>;
  };

  const filteredLeads = filterTier === 'All' 
    ? leads 
    : leads.filter(l => l.tier === filterTier);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white">Leads Management</h1>
           <p className="text-slate-400 text-sm">Manage and track student inquiries</p>
        </div>
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" onClick={handleBackfillAll} disabled={recalculating}>
             {recalculating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
             Recalculate All
           </Button>
           <Button variant="outline" size="sm" onClick={fetchLeads}>
             <RefreshCw className="w-4 h-4 mr-2" /> Refresh
           </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="All" value={filterTier} onValueChange={setFilterTier} className="w-[400px]">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="All">All Leads</TabsTrigger>
            <TabsTrigger value="A" className="data-[state=active]:text-green-400">Tier A</TabsTrigger>
            <TabsTrigger value="B" className="data-[state=active]:text-yellow-400">Tier B</TabsTrigger>
            <TabsTrigger value="C" className="data-[state=active]:text-slate-400">Tier C</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-xs text-slate-500">
           Showing {filteredLeads.length} records
        </div>
      </div>
      
      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow>
              <TableHead className="text-slate-400 w-[100px]">Date</TableHead>
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400 text-center">Score</TableHead>
              <TableHead className="text-slate-400">Payment</TableHead>
              <TableHead className="text-slate-400">Report</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="text-center py-12 text-slate-500">No leads found for this filter.</TableCell>
               </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-slate-300 text-xs">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-white">
                    {lead.name}
                    <div className="text-xs text-slate-500 font-normal mt-0.5">{lead.origin_country || 'Unknown Origin'}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-white">{lead.score || 0}</span>
                      {getTierBadge(lead.tier)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPaymentBadge(lead.payment_status)}
                    {lead.payment_amount && <div className="text-xs text-slate-500 mt-1">${lead.payment_amount / 100}</div>}
                  </TableCell>
                  <TableCell>
                    {lead.result_pdf_url ? (
                      <a href={lead.result_pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                        <FileText className="w-4 h-4" /> View PDF
                      </a>
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={lead.status || 'New'} onValueChange={(val) => updateStatus(lead.id, val)}>
                      <SelectTrigger className={`w-28 h-7 text-xs border-none ${getStatusColor(lead.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminLeads;