'use client';
import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { CalendarCog, Image, MapPin, Search, Smile, X } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import Joi from 'joi';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';


type Post = {
  _id: string
  text: string
  user: {
    _id: string
    name: string
    username: string
    profilePic: string
  }
  createdAt: string
  likes: string[]
  replies: {
    _id: string
    text: string
    userId: string
    username: string
    userProfilePic: string
    createdAt: string
  }[]
  image?: string
}


interface CreatePostFormProps {
  onPostCreated: (post: Post) => void
}

const pingSchema = Joi.object({
  input: Joi.string().max(280).required().messages({
    'string.max': 'Pings can only be 280 characters max – same as Twitter!',
    'string.empty': 'Ping cannot be empty',
  }),
});

function PingBox({ onPostCreated }: CreatePostFormProps) {
  const { user } = useAuth();
  const userId = user?._id;
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | ArrayBuffer | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Image too large',
        description: 'Max size allowed is 5MB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    const { error: validationError } = pingSchema.validate({ input: trimmedInput });

    if (validationError) {
      setError(validationError.message);
      return;
    }

    setLoading(true);

    try {
        console.log('Submitting ping:', { user });
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postedBy: userId,
          text: trimmedInput,
          img: imageUrl,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast({
          variant: 'destructive',
          title: 'Error Posting Your Ping!',
          description: data.message || 'Something went wrong. Try again.',
        });
        return;
      }

      // Success!
      setInput('');
      setImageUrl(null);
      setIsFocused(false);
      setError(null);

      toast({
        title: 'Ping posted!',
        description: 'Your ping has been shared successfully!',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Network Error',
        description: 'Failed to post ping. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex space-x-2 items-start">
        <AnimatePresence>
          {!isFocused && (
            <motion.img
              key="profile-pic"
              src={user?.profilePic || 'https://links.papareact.com/gll'}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="h-10 w-10 rounded-full"
              alt={user?.username || 'User'}
            />
          )}
        </AnimatePresence>

        <div className="flex flex-1 pl-2">
          <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
            <motion.div
              initial={{ height: '6rem' }}
              animate={{
                height: isFocused ? '10rem' : '6rem',
                boxShadow: isFocused
                  ? '0 0 10px rgba(29, 155, 240, 0.7)'
                  : '0 0 0 rgba(0,0,0,0)',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="rounded-md"
            >
              <Textarea
                placeholder="Share your pings"
                value={input}
                onFocus={() => setIsFocused(true)}
                onBlur={() => input === '' && setIsFocused(false)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 280) {
                    setInput(value);
                    if (error) setError(null);
                  }
                }}
                className="w-full bg-transparent md:text-lg font-light placeholder:text-gray-500 border-none focus:ring-0 focus-visible:outline-none resize-none outline-none h-full"
              />
            </motion.div>

            <AnimatePresence>
              {input && (
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-gray-400 mt-1 ml-2"
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="inline-block"
                  >
                    Typing...
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="text-red-500 text-sm mt-2 ml-1">{error}</div>
            )}

            <div className="text-right text-xs text-gray-500 mt-1 mr-1">
              {input.length}/280
            </div>

            {imageUrl && (
              <div className="relative mt-4">
                <button
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 bg-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>

                <motion.img
                  src={imageUrl as string}
                  alt="Preview"
                  className="rounded-md w-full max-h-60 object-cover shadow-md"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            <div className="w-full md:flex sm:flex-col md:flex-row items-center justify-between space-x-2 mt-5">
              <motion.div
                className="flex flex-1 items-center justify-between space-x-4 text-[#1d9bf0] text-lg"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: { staggerChildren: 0.15 },
                  },
                }}
              >
                <motion.div
                  key="image-icon"
                  onClick={handleImageClick}
                  variants={{
                    hidden: { opacity: 0, scale: 0 },
                    show: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.5, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="cursor-pointer"
                >
                  <Image className="h-5 w-5" />
                </motion.div>
              </motion.div>

              <Button
                type="submit"
                className="bg-[#1d9bf0] font-bold text-white px-5 mt-4 md:mt-0 disabled:cursor-not-allowed"
                disabled={!input.trim() || loading}
              >
                {loading ? 'Posting...' : 'Ping'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <hr className="flex w-full border-1 mt-4" />
    </>
  );
}

export default PingBox;
