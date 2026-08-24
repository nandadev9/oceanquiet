import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserPlanCard from "@/components/user-profile/UserPlanCard";
import ProfileTrashCard from "@/components/user-profile/ProfileTrashCard";
import { OceanPage } from "@/components/ocean/OceanStyles";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Preferências de perfil, assinatura e itens arquivados do OceanQuiet.",
};

export default function Profile() {
  return (
    <OceanPage>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Perfil
        </h3>
        <div className="space-y-6">
          <UserMetaCard />
          <UserInfoCard />
          <UserPlanCard />
          <ProfileTrashCard />
        </div>
      </div>
    </OceanPage>
  );
}
