import React, { useEffect, useMemo, useState } from 'react';
import { Monitor, RotateCw, ExternalLink, Eye, Smartphone, Tablet, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// IMPORTANT: Use Navbar/Footer directly (Layout uses <Outlet/>, not children)
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Public pages for internal preview
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import ResourcesPage from '@/pages/ResourcesPage';
import ReadinessCheckPage from '@/pages/ReadinessCheckPage';
import ContactPage from '@/pages/ContactPage';

const WebsitePreview = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [useIframe, setUseIframe] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [deviceSize, setDeviceSize] = useState('desktop'); // desktop, tablet, mobile
  const [iframeError, setIframeError] = useState(false);

  const ROUTES = useMemo(() => ([
    { label: 'Home', path: '/', component: HomePage },
    { label: 'Services', path: '/services', component: ServicesPage },
    { label: 'Resources', path: '/resources', component: ResourcesPage },
    { label: 'Readiness Check', path: '/readiness-check', component: ReadinessCheckPage },
    { label: 'About', path: '/about', component: AboutPage },
    { label: 'Contact', path: '/contact', component: ContactPage }
  ]), []);

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
    setIframeError(false);
  };

  const handleOpenNewTab = () => {
    // Opens the real public site page (not /admin)
    window.open(`${window.location.origin}${currentPath}`, '_blank', 'noopener,noreferrer');
  };

  const getPreviewUrl = () => {
    // iframe mode uses real public route
    return `${window.location.origin}${currentPath}?adminPreview=1&ts=${Date.now()}`;
  };

  const getContainerWidth = () => {
    switch (deviceSize) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const getCurrentComponent = () => {
    const route = ROUTES.find(r => r.path === currentPath);
    return route ? route.component : HomePage;
  };

  const RenderComponent = getCurrentComponent();

  useEffect(() => {
    setIframeError(false);
  }, [useIframe, currentPath]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-80px)] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
      {/* Sticky Admin Control Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900 px-6 py-4 shadow-md shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-2 py-1.5 px-3 whitespace-nowrap">
              <Eye className="h-4 w-4" />
              Preview Mode
            </Badge>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <Tabs
              value={useIframe ? 'iframe' : 'internal'}
              onValueChange={(val) => setUseIframe(val === 'iframe')}
              className="w-[200px]"
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="internal" className="data-[state=active]:bg-slate-700">
                  Internal
                </TabsTrigger>
                <TabsTrigger value="iframe" className="data-[state=active]:bg-slate-700">
                  Iframe
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Select value={currentPath} onValueChange={setCurrentPath}>
              <SelectTrigger className="w-[220px] bg-slate-950 border-slate-700 text-white focus:ring-blue-500 h-9">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {ROUTES.map((route) => (
                  <SelectItem
                    key={route.path}
                    value={route.path}
                    className="focus:bg-slate-800 focus:text-white cursor-pointer"
                  >
                    {route.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center bg-slate-800 rounded-md p-1 border border-slate-700">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeviceSize('desktop')}
                className={`h-7 w-7 ${deviceSize === 'desktop' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Desktop View"
                type="button"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeviceSize('tablet')}
                className={`h-7 w-7 ${deviceSize === 'tablet' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Tablet View"
                type="button"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeviceSize('mobile')}
                className={`h-7 w-7 ${deviceSize === 'mobile' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
                title="Mobile View"
                type="button"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleReload}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 h-9 w-9"
              title="Reload Preview"
              type="button"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenNewTab}
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 h-9 w-9"
              title="Open in New Tab"
              type="button"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className="flex-1 bg-slate-900 overflow-hidden flex justify-center relative">
        <div
          className={`h-full transition-all duration-300 ease-in-out bg-white shadow-2xl relative ${deviceSize !== 'desktop'
              ? 'my-4 border-x-4 border-slate-800 rounded-lg overflow-hidden'
              : 'w-full'
            }`}
          style={{ width: getContainerWidth() }}
        >
          {useIframe ? (
            !iframeError ? (
              <iframe
                key={`${currentPath}-${reloadKey}`}
                src={getPreviewUrl()}
                className="w-full h-full border-0"
                title="Website Preview"
                // Sandbox causes warnings but is safer; allow-popups for “Open in new tab” behaviors.
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onError={() => setIframeError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 p-8 text-center bg-slate-50">
                <div className="bg-red-50 p-4 rounded-full">
                  <Globe className="h-12 w-12 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Preview Unavailable</h3>
                  <p className="max-w-md mt-2 text-sm">
                    The iframe preview could not be loaded. This is commonly caused by browser security restrictions.
                  </p>
                </div>
                <Button onClick={handleOpenNewTab} variant="outline" className="mt-2" type="button">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            )
          ) : (
            <div
              className="h-full w-full overflow-y-auto bg-slate-950 text-slate-50"
              key={`internal-${currentPath}-${reloadKey}`}
            >
              {/* Internal preview renders the SAME public shell (Navbar + Footer) */}
              <Navbar />
              <main className="flex-grow pt-20">
                <RenderComponent />
              </main>
              <Footer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;