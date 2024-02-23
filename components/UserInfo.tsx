"use client";

import { getUserWithSession } from "@/app/server/auth";
import { User } from "@/types/user";
import { signOut, useSession } from "next-auth/react";

type UserInfoProps = {
  user: User;
};

export default function UserInfo({ user }: UserInfoProps) {
  const handleLogout = async () => {
    await signOut();
  };

  const { data } = useSession();
  console.log(data, "session");

  return (
    <div className="rounded-lg border shadow-lg p-10">
      <div>Id : {user.id}</div>
      <div>Name : {user.name}</div>
      <div>Email : {user.email}</div>
      <button
        className="font-medium mt-2 text-blue-600 hover:underline"
        onClick={handleLogout}
      >
        Log out
      </button>
      <div className="flex flex-col mt-8">
        <button
          type="button"
          className="bg-blue-400 p-2 rounded-md appearance-none"
          onClick={() => getUserWithSession(data?.user.access_token!)}
        >
          Fetch Session User
        </button>
      </div>
    </div>
  );
}
