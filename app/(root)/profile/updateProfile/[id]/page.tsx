import UpdateProfile from '@/components/profile/updateAbout';
import { SignUp } from '@/components/SignUp';
import React from 'react';


// Function to fetch all users
const fetchProfileData = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/all`);
  if (!res.ok) {
    console.error('Failed to fetch profile data');
    return;
  }
  const data = await res.json();
  return data;
};


export async function generateStaticParams({ params }: { params: { id: string } }) {
  const { id } = params;
  const users = await fetchProfileData(); 
  return users.map((user: { _id: string }) => ({ id: user._id }));
}

// Function to fetch individual user details
const fetchUserDetails = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/${id}`);
  if (!res.ok) {
    console.error('Failed to fetch user details');
    return null;
  }
  const data = await res.json();
  return data;
};

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params; // Destructure the id from params
  
  const user = await fetchUserDetails(id);

  if (!user) {
    return <div>User not found</div>; 
  }
  return (
    <div className="relative w-screen h-screen bg-black">
      <UpdateProfile user={user} /> 
    </div>
  );
}