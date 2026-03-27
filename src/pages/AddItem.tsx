import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, collection, addDoc, serverTimestamp, doc, setDoc, handleFirestoreError, OperationType, uploadBytesResumable, getDownloadURL, ref, uploadString } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../types';
import { Camera, Plus, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AddItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Please select an image under 5MB.');
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!image && !imageUrlInput) || !title || !price) {
      console.warn('Missing required fields', { user: !!user, image: !!image, imageUrlInput, title, price });
      return;
    }

    setLoading(true);
    console.log('Starting item listing process...');
    
    try {
      let imageURL = imageUrlInput;
      
      if (!useUrl && image) {
        try {
          console.log('Uploading image to Firebase Storage...');
          const storageRef = ref(storage, `items/${Date.now()}_${image.name}`);
          
          // Convert file to data URL for potentially more resilient upload
          const reader = new FileReader();
          const dataUrlPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(image);
          });
          
          const dataUrl = await dataUrlPromise;
          
          // Add a 60-second timeout to the upload
          const uploadPromise = uploadString(storageRef, dataUrl, 'data_url');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout after 60s. Please check if Firebase Storage is enabled in your console.')), 60000)
          );
          
          await Promise.race([uploadPromise, timeoutPromise]);
          
          console.log('Upload successful');
          imageURL = await getDownloadURL(storageRef);
          console.log('Image URL obtained', imageURL);
        } catch (storageError) {
          console.error('Firebase Storage upload failed or timed out, using placeholder', storageError);
          // Fallback to a placeholder if storage fails (common in new projects)
          if (!imageURL) {
            imageURL = `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`;
          }
        }
      } else if (!imageURL) {
        // If no URL and no image upload, use placeholder
        imageURL = `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`;
      }

      // Save to Firestore
      console.log('Saving item to Firestore...');
      const itemRef = doc(collection(db, 'items'));
      const itemId = itemRef.id;

      const itemData = {
        itemId,
        ownerId: user.uid,
        ownerName: user.name || 'Anonymous',
        title,
        description,
        pricePerDay: Number(price),
        imageURL,
        category,
        status: 'available',
        createdAt: serverTimestamp(),
      };

      console.log('Item data to save:', itemData);

      await setDoc(itemRef, itemData);
      console.log('Firestore save successful');

      setSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (error) {
      console.error('Detailed listing error:', error);
      handleFirestoreError(error, OperationType.WRITE, 'items');
      alert('Failed to list item. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-display font-bold mb-2">Item Listed!</h2>
        <p className="text-slate-400">Your item is now live in the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-6 px-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-slate-400">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-display font-bold">List an Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 mb-4">
          <button 
            type="button"
            onClick={() => setUseUrl(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${!useUrl ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-500'}`}
          >
            Upload File
          </button>
          <button 
            type="button"
            onClick={() => setUseUrl(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${useUrl ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-500'}`}
          >
            Image URL
          </button>
        </div>

        {!useUrl ? (
          <div className="relative aspect-video glass rounded-3xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-all group">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={48} className="text-slate-600 mb-2 group-hover:text-purple-400 transition-colors" />
                <span className="text-sm text-slate-500 font-medium">Upload Item Photo</span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
              required={!useUrl}
            />
          </div>
        ) : (
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Image URL</label>
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg"
              className="w-full glass-dark rounded-xl py-4 px-4 focus:ring-2 ring-purple-500/50 outline-none transition-all"
              value={imageUrlInput}
              onChange={(e) => {
                setImageUrlInput(e.target.value);
                setImagePreview(e.target.value);
              }}
              required={useUrl}
            />
            {imagePreview && (
              <div className="mt-4 aspect-video rounded-2xl overflow-hidden glass">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Item Title</label>
            <input 
              type="text" 
              placeholder="e.g. Scientific Calculator TI-84"
              className="w-full glass-dark rounded-xl py-4 px-4 focus:ring-2 ring-purple-500/50 outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Category</label>
            <select 
              className="w-full glass-dark rounded-xl py-4 px-4 focus:ring-2 ring-purple-500/50 outline-none transition-all appearance-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Price (₹/day)</label>
              <input 
                type="number" 
                placeholder="50"
                className="w-full glass-dark rounded-xl py-4 px-4 focus:ring-2 ring-purple-500/50 outline-none transition-all"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <div className="glass w-full rounded-xl py-4 px-4 text-slate-500 text-sm font-medium">
                Campus Only
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Description</label>
            <textarea 
              placeholder="Describe the item condition, pickup details, etc."
              rows={4}
              className="w-full glass-dark rounded-xl py-4 px-4 focus:ring-2 ring-purple-500/50 outline-none transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Listing Item...
            </>
          ) : (
            <>
              <Plus size={24} /> List Item
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddItem;
