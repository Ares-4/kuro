import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Plus, 
  Trash2, 
  Clock, 
  Globe, 
  DollarSign, 
  MapPin, 
  Save, 
  X,
  Upload,
  BookOpen,
  Eye,
  GripVertical
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Reorder } from "framer-motion";

const CourseEditor = ({ course, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    program_name: '',
    university: '',
    country: '',
    degree_level: 'Bachelor',
    duration: '',
    tuition_fee: '',
    currency: 'EUR', // Default currency
    language: 'English',
    description: '',
    requirements: [],
    image_url: '',
    processing_time: '2-4 Weeks',
    application_fee: '€50',
    is_active: true,
  });
  
  const [universities, setUniversities] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [existingRequirements, setExistingRequirements] = useState([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');

  const CURRENCIES = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  ];

  const getCurrencySymbol = (code) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  useEffect(() => {
    // Fetch universities for the dropdown
    const fetchUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('id, name, destinations(name)')
          .order('name');
        
        if (error) throw error;
        setUniversities(data || []);
      } catch (err) {
        console.error("Error fetching universities:", err);
      }
    };

    // Fetch destinations (countries) for the dropdown
    const fetchDestinations = async () => {
      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setDestinations(data || []);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      }
    };

    // Fetch all existing requirements from other programs to populate the dropdown
    const fetchExistingRequirements = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('requirements');
        
        if (error) throw error;
        
        // Flatten array, remove duplicates, filter null/empty
        const allReqs = data
          .flatMap(p => p.requirements || [])
          .filter(Boolean);
        const uniqueReqs = [...new Set(allReqs)].sort();
        
        setExistingRequirements(uniqueReqs);
      } catch (err) {
        console.error("Error fetching requirements:", err);
      }
    };
    
    fetchUniversities();
    fetchDestinations();
    fetchExistingRequirements();

    if (course) {
      setFormData({
        ...course,
        requirements: course.requirements || [],
        image_url: course.image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
        application_fee: course.application_fee || '€50',
        processing_time: course.processing_time || '2-4 Weeks',
        // Ensure currency has a fallback if undefined in existing records
        currency: course.currency || 'EUR', 
      });
    }
  }, [course]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUniversityChange = (value) => {
    const selectedUni = universities.find(u => u.name === value);
    
    setFormData(prev => ({
      ...prev,
      university: value,
      country: selectedUni?.destinations?.name || prev.country
    }));
  };

  const handleAddRequirement = (reqToAdd = newRequirement) => {
    const trimmedReq = reqToAdd.trim();
    if (trimmedReq) {
      // Prevent duplicates
      if (formData.requirements.includes(trimmedReq)) {
        toast({
          title: "Requirement already exists",
          description: "This item is already in the list.",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, trimmedReq]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (reqToRemove) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const handleReorderRequirements = (newOrder) => {
    setFormData(prev => ({
      ...prev,
      requirements: newOrder
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        program_name: formData.program_name,
        university: formData.university,
        country: formData.country,
        degree_level: formData.degree_level,
        duration: formData.duration,
        tuition_fee: formData.tuition_fee,
        currency: formData.currency, // This field now corresponds to the DB column
        language: formData.language,
        description: formData.description,
        requirements: formData.requirements,
        image_url: formData.image_url,
        processing_time: formData.processing_time,
        application_fee: formData.application_fee,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      if (!course?.id) {
        dataToSave.created_at = new Date().toISOString();
      }

      const { data, error } = course?.id 
        ? await supabase.from('programs').update(dataToSave).eq('id', course.id).select()
        : await supabase.from('programs').insert([dataToSave]).select();

      if (error) throw error;

      toast({
        title: "Course Saved Successfully",
        description: "Your changes are now live on the student dashboard.",
        className: "bg-green-600 border-none text-white"
      });
      
      if (onSave) onSave(data[0]);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Error saving course",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Preview Component
  const CoursePreview = ({ data }) => {
    const symbol = getCurrencySymbol(data.currency);
    
    return (
      <div className="h-full overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg shadow-2xl relative">
        <div className="absolute top-4 right-4 z-30">
          <Badge variant="outline" className="bg-black/50 backdrop-blur text-white border-white/20">
            <Eye className="w-3 h-3 mr-1" /> Live Preview
          </Badge>
        </div>
        
        <div className="relative h-64 w-full overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />
          <img 
            src={data.image_url} 
            alt={data.program_name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
             <Badge className="mb-3 bg-blue-600/90 hover:bg-blue-600 text-white border-none uppercase tracking-wider text-xs font-semibold px-3 py-1">
               {data.degree_level}
             </Badge>
             <h1 className="text-3xl font-bold text-white mb-2">{data.program_name || "Program Title"}</h1>
             <div className="flex items-center text-slate-300 gap-2">
               <BookOpen className="w-4 h-4" />
               <span className="font-medium">{data.university || "University Name"}, {data.country || "Country"}</span>
             </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Duration</span>
              </div>
              <p className="text-white font-semibold">{data.duration ? `${data.duration} Years` : "N/A"}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Language</span>
              </div>
              <p className="text-white font-semibold">{data.language || "N/A"}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Tuition</span>
              </div>
              <p className="text-white font-semibold">
                {data.tuition_fee ? `${symbol}${data.tuition_fee}` : "N/A"}
              </p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Location</span>
              </div>
              <p className="text-white font-semibold">{data.country || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">About the Program</h3>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                  {data.description || "No description provided."}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Requirements & Eligibility</h3>
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="pt-6">
                    {data.requirements && data.requirements.length > 0 ? (
                      <ul className="space-y-4">
                        {data.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-slate-300">{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 italic">No specific requirements listed.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
               <Card className="bg-slate-900 border-slate-800 sticky top-6">
                 <CardHeader className="pb-4">
                   <CardTitle className="text-lg text-white">Application Summary</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-400">Application Fee</span>
                     <span className="text-white font-medium">{data.application_fee}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-400">Processing Time</span>
                     <span className="text-white font-medium">{data.processing_time}</span>
                   </div>
                   <Separator className="bg-slate-800" />
                   <div className="flex justify-between items-center">
                     <span className="text-slate-300 font-medium">Total Due Now</span>
                     <span className="text-xl font-bold text-green-400">€0.00</span>
                   </div>
                   <p className="text-[10px] text-slate-500 text-right">* Fee paid after initial review</p>
                   
                   <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded text-xs text-blue-200">
                     This is a preview of the application sidebar seen by students.
                   </div>
                   
                   <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                     Start Application
                   </Button>
                 </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             {course ? 'Edit Course' : 'Create New Course'}
           </h2>
           <p className="text-slate-400 text-sm">
             {course ? `Editing ${course.program_name}` : 'Add a new program to the catalog'}
           </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex text-sm">
              <button 
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'edit' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-md transition-colors lg:hidden ${activeTab === 'preview' ? 'bg-slate-800 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Preview
              </button>
           </div>
           <Button variant="outline" onClick={onCancel} className="border-slate-700 text-slate-300 hover:bg-slate-800">
             <X className="w-4 h-4 mr-2" /> Cancel
           </Button>
           <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
             {loading ? <span className="animate-spin mr-2">⏳</span> : <Save className="w-4 h-4 mr-2" />}
             Save Changes
           </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Editor Column */}
        <div className={`flex flex-col overflow-y-auto pr-2 ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 text-slate-400 w-full justify-start mb-4">
              <TabsTrigger value="general" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">General Info</TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Details & Fees</TabsTrigger>
              <TabsTrigger value="requirements" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Requirements</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Program Name</Label>
                    <Input 
                      value={formData.program_name}
                      onChange={(e) => handleChange('program_name', e.target.value)}
                      placeholder="e.g. Mechanical Engineering"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">University</Label>
                      <Select 
                        value={formData.university} 
                        onValueChange={handleUniversityChange}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select University" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                          {universities.map((uni) => (
                            <SelectItem key={uni.id} value={uni.name}>
                              {uni.name}
                            </SelectItem>
                          ))}
                          {universities.length === 0 && (
                            <div className="p-2 text-sm text-slate-500 text-center">No universities found</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Country</Label>
                      <Select 
                        value={formData.country} 
                        onValueChange={(val) => handleChange('country', val)}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                          {destinations.map((dest) => (
                            <SelectItem key={dest.id} value={dest.name}>
                              {dest.name}
                            </SelectItem>
                          ))}
                          {destinations.length === 0 && (
                            <div className="p-2 text-sm text-slate-500 text-center">No countries found</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Banner Image URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={formData.image_url}
                        onChange={(e) => handleChange('image_url', e.target.value)}
                        placeholder="https://..."
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <Button size="icon" variant="outline" className="border-slate-700 shrink-0">
                         <Upload className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">Provide a direct link to an image (Unsplash, etc.)</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">About the Program</Label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Detailed description of the program..."
                      className="bg-slate-800 border-slate-700 text-white min-h-[200px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Degree Level</Label>
                        <Select 
                          value={formData.degree_level} 
                          onValueChange={(val) => handleChange('degree_level', val)}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Language</Label>
                        <Input 
                          value={formData.language}
                          onChange={(e) => handleChange('language', e.target.value)}
                          placeholder="e.g. English"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Duration (Years)</Label>
                        <Input 
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={formData.duration}
                          onChange={(e) => handleChange('duration', e.target.value)}
                          placeholder="e.g. 3.5"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                        <p className="text-xs text-slate-500">Enter number of years (e.g. 1.5, 3, 4)</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Tuition Fee</Label>
                        <div className="flex gap-2">
                          <div className="w-1/3 min-w-[100px]">
                            <Select 
                              value={formData.currency} 
                              onValueChange={(val) => handleChange('currency', val)}
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="EUR" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                {CURRENCIES.map(curr => (
                                  <SelectItem key={curr.code} value={curr.code}>
                                    {curr.code} ({curr.symbol})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Input 
                            value={formData.tuition_fee}
                            onChange={(e) => handleChange('tuition_fee', e.target.value)}
                            placeholder="Amount e.g. 5000"
                            className="bg-slate-800 border-slate-700 text-white flex-1"
                          />
                        </div>
                        <p className="text-xs text-slate-500">
                          {formData.currency && formData.tuition_fee ? 
                            `Total: ${getCurrencySymbol(formData.currency)}${formData.tuition_fee} / year` : 
                            'Enter amount per year'}
                        </p>
                      </div>
                   </div>

                   <Separator className="bg-slate-800 my-4" />

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Processing Time</Label>
                        <Input 
                          value={formData.processing_time}
                          onChange={(e) => handleChange('processing_time', e.target.value)}
                          placeholder="e.g. 2-4 Weeks"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Application Fee</Label>
                        <Input 
                          value={formData.application_fee}
                          onChange={(e) => handleChange('application_fee', e.target.value)}
                          placeholder="e.g. €250"
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                   </div>

                   <div className="flex items-center space-x-2 pt-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="is_active" 
                          checked={formData.is_active}
                          onChange={(e) => handleChange('is_active', e.target.checked)}
                          className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"
                        />
                        <Label htmlFor="is_active" className="text-white cursor-pointer">Program is Active & Visible</Label>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-4">
               <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base text-white">Checklist Items</CardTitle>
                    <CardDescription className="text-slate-400">Add requirements that students must meet. Drag to reorder.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {/* History Dropdown */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400 uppercase font-semibold">Quick Add from History</Label>
                        <Select onValueChange={(val) => handleAddRequirement(val)}>
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Select a previously used requirement..." />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60">
                            {existingRequirements.map((req, i) => (
                              <SelectItem key={i} value={req}>{req}</SelectItem>
                            ))}
                            {existingRequirements.length === 0 && (
                              <div className="p-2 text-sm text-slate-500 text-center">No history available</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Manual Entry */}
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-400 uppercase font-semibold">Or Add New</Label>
                        <div className="flex gap-2">
                            <Input 
                              value={newRequirement}
                              onChange={(e) => setNewRequirement(e.target.value)}
                              placeholder="e.g. High school diploma"
                              className="bg-slate-800 border-slate-700 text-white"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddRequirement()}
                            />
                            <Button onClick={() => handleAddRequirement()} className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                      </div>
                    </div>

                     <div className="space-y-2 pt-2">
                        <Reorder.Group axis="y" values={formData.requirements} onReorder={handleReorderRequirements} className="space-y-2">
                          {formData.requirements.map((req) => (
                             <Reorder.Item key={req} value={req}>
                               <div className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700 group hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing">
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                                    <span className="text-slate-200 text-sm flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500/50" />
                                      {req}
                                    </span>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent drag start
                                      handleRemoveRequirement(req);
                                    }}
                                    className="text-slate-500 hover:text-red-400 hover:bg-slate-700"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </Button>
                               </div>
                             </Reorder.Item>
                          ))}
                        </Reorder.Group>

                        {formData.requirements.length === 0 && (
                          <div className="text-center py-6 text-slate-500 border border-dashed border-slate-800 rounded">
                            No requirements added yet.
                          </div>
                        )}
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Column */}
        <div className={`flex flex-col bg-slate-900/50 p-6 rounded-lg border border-slate-800/50 ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" /> Live Preview
              </h3>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-400/30 bg-blue-400/10">
                Student View
              </Badge>
           </div>
           <CoursePreview data={formData} />
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;