'use client';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react'


function Pings() {
    const [pings, setPings] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const getFeedPings = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pings/feed`, { credentials: "include" });
                const data = await res.json();
                console.log(data);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error Fetching Pings",
                    description: "There was an error fetching Pings, try refreshing your page."
                });
            } finally {
                setLoading(false);
            }
        };
        getFeedPings();
    }, [toast])


    return (
        <div>Pings</div>
    )
}

export default Pings