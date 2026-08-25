import type { Metadata } from "next";
import OceanHome from "@/components/home/OceanHome";

export const metadata: Metadata = {
  title: "Início",
  description: "Seu ponto de partida no OceanQuiet.",
};

export default function HomePage() {
  return <OceanHome />;
}
