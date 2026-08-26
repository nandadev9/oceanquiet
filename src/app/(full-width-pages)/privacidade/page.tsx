import type { Metadata } from "next";
import PrivacyPolicyPage from "@/components/help/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "Política de Privacidade | OceanQuiet",
  description: "Política de privacidade do OceanQuiet para a versão atual do protótipo.",
};

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
