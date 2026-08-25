import ProfilePageContent from "@/components/user-profile/ProfilePageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Preferências de perfil, assinatura e itens arquivados do OceanQuiet.",
};

export default function Profile() {
  return <ProfilePageContent />;
}
