"use client";

import { auth, db } from "@/Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: name });
    await setDoc(doc(db, "users", userCred.user.uid), { name, email });
    router.push("/dashboard");
  };

  return (
    <div className="p-6">
      <h1>Register</h1>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Sign Up</button>
    </div>
  );
}
