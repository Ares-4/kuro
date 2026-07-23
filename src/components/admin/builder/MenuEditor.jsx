import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Note: react-beautiful-dnd might not be installed, using native drag/drop for reliability in this env
import { Plus, Trash2, Save, GripVertical, AlertCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getSiteSetting, setSiteSetting } from '@/lib/settingsStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_MENU = [
  { id: '1', label: 'Home', path: '/' },
  { id: '2', label: 'About', path: '/about' },
  { id: '3', label: 'Destinations', path: '/destinations' },
  { id: '4', label: 'Services', path: '/services' },
  { id: '5', label: 'Resources', path: '/resources' }
];

const MenuEditor = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    const savedMenu = await getSiteSetting('main_navigation');
    
    if (savedMenu && Array.isArray(savedMenu) && savedMenu.length > 0) {
      // Ensure IDs exist for drag/drop
      const withIds = savedMenu.map((item, idx) => ({
        ...item,
        id: item.id || `menu-item-${Date.now()}-${idx}`
      }));
      setMenuItems(withIds);
    } else {
      setMenuItems(DEFAULT_MENU);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Strip internal IDs before saving if desired, but keeping them is usually fine.
    // Let's clean up slightly to ensure valid data structure.
    const cleanMenu = menuItems.map(({ label, path }) => ({ label, path }));
    
    const success = await setSiteSetting('main_navigation', cleanMenu);
    
    if (success) {
      toast({ title: 'Success', description: 'Navigation menu updated successfully.' });
    } else {
      toast({ title: 'Error', description: 'Failed to update navigation menu.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleAdd = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      label: 'New Link',
      path: '/'
    };
    setMenuItems([...menuItems, newItem]);
  };

  const handleDelete = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleEdit = (id, field, value) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // --- Drag and Drop Logic (Native HTML5) ---

  const handleDragStart = (e, index) => {
    setDraggedItem(menuItems[index]);
    e.dataTransfer.effectAllowed = "move";
    // Ghost image handling can be default
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.dataTransfer.setDragImage(e.target.parentNode, 20, 20);
  };

  const handleDragOver = (index) => {
    const draggedOverItem = menuItems[index];

    // If the item is dragged over itself, ignore
    if (draggedItem === draggedOverItem) {
      return;
    }

    // Filter out the currently dragged item
    let items = menuItems.filter(item => item !== draggedItem);

    // Add the dragged item after the dragged over item
    items.splice(index, 0, draggedItem);

    setMenuItems(items);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Navigation Menu</h2>
          <p className="text-slate-400">Configure the main top navigation bar links.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-blue-600 hover:bg-blue-700">
          {saving ? 'Saving...' : 'Save Menu'} <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Drag items to reorder. Changes apply after saving.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading menu...</div>
              ) : (
                <ul className="space-y-3">
                  {menuItems.map((item, index) => (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={() => handleDragOver(index)}
                      onDragEnd={handleDragEnd}
                      className="group bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-4 hover:border-blue-500/50 transition-colors cursor-move"
                    >
                      <div className="text-slate-500 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500 uppercase">Label</Label>
                          <Input 
                            value={item.label}
                            onChange={(e) => handleEdit(item.id, 'label', e.target.value)}
                            className="bg-slate-900 border-slate-700 h-9"
                            placeholder="e.g. About"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-500 uppercase">Path</Label>
                          <Input 
                            value={item.path}
                            onChange={(e) => handleEdit(item.id, 'path', e.target.value)}
                            className="bg-slate-900 border-slate-700 h-9 font-mono text-xs"
                            placeholder="e.g. /about"
                          />
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-900/10 self-end mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <Button onClick={handleAdd} variant="outline" className="w-full border-dashed border-slate-700 hover:bg-slate-800 hover:text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Menu Item
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                  <div className="w-24 h-6 bg-slate-800 rounded animate-pulse opacity-50"></div>
                  <div className="flex gap-2">
                     <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
                  </div>
                </div>
                
                {/* Simulated Navbar */}
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-900 transition-colors">
                      <LinkIcon className="w-3 h-3 text-blue-500" />
                      <span className="text-sm font-medium text-slate-300">{item.label || 'Untitled'}</span>
                    </div>
                  ))}
                </nav>
              </div>

              <Alert className="mt-4 bg-blue-900/20 border-blue-900/50">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertTitle className="text-blue-400">Note</AlertTitle>
                <AlertDescription className="text-blue-300/80 text-xs">
                  This preview shows the structure. The actual navbar style depends on the public site theme.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;