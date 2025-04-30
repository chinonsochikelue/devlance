// components/profile/UserDataWrapper.tsx
'use client';

import useUser from '@/atoms/userAtom';
import UserData from '@/components/profile/UserData';
import { useEffect } from 'react';

export default function UserDataWrapper({ user }: { user: any }) {
  // const { setUser } = useUser();

  // useEffect(() => {
  //   if (user) {
  //     setUser(user); // hydrate the atom/client state
  //   }
  // }, [user]);

  return <UserData user={user} />;
}
