'use client';

import React, { useState } from 'react';
import { Logo } from '../logo';
import SideBarRow from './SideBarRow';
import {
  BellIcon,
  Hash,
  HomeIcon,
  LogOut,
  MailIcon,
  UserCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { logout, useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function SideBar() {
  const { user, logout: logoutUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading] = useState(false)

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      logoutUser()
      toast({
        title: "Success",
        description: "You've successfuly loged out."
      })
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col col-span-2 items-center md:items-start">
        <Logo />
        <p className="text-muted-foreground mt-4">Loading user...</p>
      </div>
    );
  }

  const id = user?._id;

  return (
    <div className="flex flex-col col-span-2 items-center md:items-start">
      <Logo />
      <SideBarRow Icon={HomeIcon} title="Home" />
      <SideBarRow Icon={Hash} title="Explore" />
      <SideBarRow Icon={BellIcon} title="Notifications" />
      <SideBarRow Icon={MailIcon} title="Messages" />
      {user && (
        <Link href={`/profile/${id}`}>
          <SideBarRow Icon={UserCircle} title={user?.name || 'Profile'} />
        </Link>
      )}

      <div className="mt-36">
        <SideBarRow Icon={LogOut} title="Log Out" onClick={handleLogout} />
      </div>
    </div>
  );
}

export default SideBar;
