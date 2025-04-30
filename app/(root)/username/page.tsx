// app/[username]/page.tsx

import React from 'react';

export async function generateStaticParams() {
  const {id} = await fetch('http://localhost:5000/api/users/').then(res => res.json());
  console.log(id)
  return [
    { username: 'john' },
    { username: 'jane' },
    { username: 'doe' },
  ];
}

export default function Page({ params }: { params: { username: string } }) {
  return (
    <div>
      <h1>Username Page: {params.username}</h1>
      <p>Welcome to the username page!</p>
    </div>
  );
}
