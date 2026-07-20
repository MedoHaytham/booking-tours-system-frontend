'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUpdateMeMutation } from '@/features/userSlice';
import { useAlert } from '@/context/AlertContext';

export default function UserDataForm({ user }) {
  const [updateMe, { isLoading: loading }] = useUpdateMeMutation();
  const { showAlert } = useAlert();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);


  const currentPhoto = preview
    ? preview
    : user?.photo?.startsWith('http')
    ? user.photo
    : `/img/users/${user?.photo || 'default.jpg'}`;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let body;
      if (photoFile) {
        body = new FormData();
        body.append('name', name);
        body.append('email', email);
        body.append('photo', photoFile);
      } else {
        body = { name, email };
      }

      await updateMe(body).unwrap();
      showAlert('success', 'Settings updated successfully!');
      setPhotoFile(null);
      setPreview(null);
    } catch (err) {
      showAlert('error', err?.data?.message || err?.message || 'Could not update settings.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <label htmlFor="name" className="block text-base font-bold mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-sm bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-base font-bold mb-2">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-sm bg-grey-200 border-t-[3px] border-b-[3px] border-transparent px-7 py-5 text-sm transition-all focus:outline-none focus:border-b-primary"
        />
      </div>

      <div className="flex items-center gap-8 text-base">
        {user?.photo && (
          <Image
            src={currentPhoto}
            alt={`Photo of ${user?.name}`}
            width={75}
            height={75}
            className="rounded-full object-cover h-30 w-30"
          />
        )}
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          onChange={handlePhotoChange}
          className="form__upload"
        />
        <label
          htmlFor="photo"
          className="text-primary inline-block border-b border-primary px-1 py-0.5 cursor-pointer transition-all hover:bg-primary hover:text-white"
        >
          Choose new photo
        </label>
      </div>

      <div className="text-right">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white uppercase text-sm rounded-full px-10 py-4 transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  );
}

