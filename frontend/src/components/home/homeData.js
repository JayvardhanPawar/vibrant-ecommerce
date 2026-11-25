import { Printer, Droplets, Disc3, Cable } from "lucide-react";

export const categories = [
  {
    name: "Printers",
    description: "Laser, inkjet & multifunction",
    icon: Printer,
    keywords: ["printer", "laser", "inkjet", "multifunction", "mfp"],
  },
  {
    name: "Ink & Toner",
    description: "Supplies for everyday printing",
    icon: Droplets,
    keywords: ["ink", "toner", "bottle", "refill"],
  },
  {
    name: "Cartridges & Drums",
    description: "Cartridges, drums & imaging units",
    icon: Disc3,
    keywords: ["cartridge", "drum", "imaging"],
  },
  {
    name: "Accessories",
    description: "Parts and printer accessories",
    icon: Cable,
    keywords: ["cable", "tray", "roller", "maintenance", "accessory", "adapter"],
  },
];

export const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export function scrollToCatalog() {
  document.getElementById("product-catalog")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
