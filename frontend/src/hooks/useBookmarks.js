import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

export const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const { data } = await apiClient.get('/schemes/user/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return data.data; // Array of schemes
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schemeSlug) => {
      const token = localStorage.getItem('token');
      const { data } = await apiClient.post('/schemes/bookmark', 
        { scheme_slug: schemeSlug },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return data.data;
    },
    onMutate: async (schemeSlug) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previousBookmarks = queryClient.getQueryData(['bookmarks']);
      
      // Optimistically update
      queryClient.setQueryData(['bookmarks'], (old) => {
        if (!old) return [{ slug: schemeSlug }]; // Mock temporary entry
        if (old.some(b => b.slug === schemeSlug)) return old;
        return [...old, { slug: schemeSlug }];
      });
      
      return { previousBookmarks };
    },
    onError: (err, schemeSlug, context) => {
      queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schemeSlug) => {
      const token = localStorage.getItem('token');
      const { data } = await apiClient.delete(`/schemes/bookmark/${schemeSlug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return data;
    },
    onMutate: async (schemeSlug) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previousBookmarks = queryClient.getQueryData(['bookmarks']);
      
      queryClient.setQueryData(['bookmarks'], (old) => {
        if (!old) return [];
        return old.filter(b => b.slug !== schemeSlug);
      });
      
      return { previousBookmarks };
    },
    onError: (err, schemeSlug, context) => {
      queryClient.setQueryData(['bookmarks'], context.previousBookmarks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};
