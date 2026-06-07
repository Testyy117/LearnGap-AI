'use client';
import { useEffect, useState } from 'react';

export function UserName() {
  const [name, setName] = useState('there');
  useEffect(() => {
    const stored = localStorage.getItem('userName');
    if (stored) setName(stored.split(' ')[0]);
  }, []);
  return <span>{name}</span>;
}
