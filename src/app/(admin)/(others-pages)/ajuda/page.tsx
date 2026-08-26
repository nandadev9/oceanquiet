import type { Metadata } from "next";
import HelpCenter from "@/components/help/HelpCenter";

export const metadata: Metadata = {
  title: "Ajuda | OceanQuiet",
  description: "FAQ, privacidade e suporte do OceanQuiet.",
};

export default function HelpPage() {
  return <HelpCenter />;
}
