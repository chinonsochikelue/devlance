// hooks/useGetUserProfile.ts
'use client'
import { useEffect, useState } from "react";
import { useParams } from 'next/navigation'
import { useToast } from './use-toast'

const useGetUserProfile = () => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const { username } = useParams();
	const { toast } = useToast();

	useEffect(() => {
		if (!username) return;

		const getUser = async () => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/${username}`, {
					credentials: "include"
				});
				if (!res.ok) throw new Error('Failed to fetch user');

				const data = await res.json();
				setUser(data.user);
			} catch (error) {
				console.error(error);
				toast({
					title: "Error",
					description: "Could not load user profile",
					variant: "destructive"
				});
			} finally {
				setLoading(false);
			}
		};

		getUser();
	}, [username]);

	return { user, loading };
};

export default useGetUserProfile;
