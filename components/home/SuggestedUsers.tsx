import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react'
import FollowList from './FollowList';

function SuggestedUsers() {
    const [loading, setLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const { toast } = useToast();


    useEffect(() => {
        const getSuggestedUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/all`, { credentials: "include" });
                const data = await res.json();
                // console.log(data)
                if (data.error) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Error fetching suggestions"
                    });
                    return;
                }
                setSuggestedUsers(data);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error fetching suggestions"
                });
            } finally {
                setLoading(false);
            }
        };

        getSuggestedUsers();
    }, [toast]);

    return (
        <div className='overflow-auto'>
            {loading ? <p className="text-sm text-gray-400 px-4">Loading suggestions...</p>
                : suggestedUsers.map((user) => (
                    <FollowList key={user._id || user.id} user={user} />
                ))
            }

        </div>
    )
}

export default SuggestedUsers