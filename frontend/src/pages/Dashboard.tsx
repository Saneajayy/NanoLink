import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Link as LinkIcon, BarChart3, MoreVertical, Copy, ExternalLink, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

import CreateLinkModal from '../components/CreateLinkModal';

interface LinkItem {
  _id: string;
  title?: string;
  originalUrl: string;
  slug: string;
  totalClicks: number;
  createdAt: string;
  isActive: boolean;
}

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext) || {};
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLinks = async () => {
    try {
      const res = await api.get('/links');
      setLinks(res.data);
    } catch (error) {
      toast.error('Failed to load links');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  if (loading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleCopy = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CreateLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLinkCreated={fetchLinks} 
      />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your shortened links</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Link
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading links...</div>
        ) : links.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <LinkIcon className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No links yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Create your first short link to start tracking clicks and sharing with your audience.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create your first link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Short Link</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Original URL</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Clicks</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {links.map((link) => (
                  <tr key={link._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1.5" onClick={() => handleCopy(link.slug)}>
                          {window.location.host}/r/{link.slug}
                          <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-indigo-600" />
                        </div>
                      </div>
                      {link.title && <div className="text-xs text-slate-500 mt-1">{link.title}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5 max-w-xs truncate">
                        {link.originalUrl}
                        <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-600">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RouterLink to={`/dashboard/links/${link._id}`} className="flex items-center gap-1.5 text-indigo-600 font-medium hover:text-indigo-800">
                        <BarChart3 className="h-4 w-4" />
                        {link.totalClicks} Analytics
                      </RouterLink>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
