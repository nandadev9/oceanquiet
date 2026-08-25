"use client";

import { useI18n } from "@/context/LanguageContext";
import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";
import UserPlanCard from "./UserPlanCard";
import ProfileTrashCard from "./ProfileTrashCard";
import { OceanPage } from "@/components/ocean/OceanStyles";

export default function ProfilePageContent() {
  const { t } = useI18n();

  return (
    <OceanPage>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          {t("profile.title")}
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
