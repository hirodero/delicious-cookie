import { Wallpoet } from "next/font/google";
import { Arimo, Sail } from "next/font/google";
export const sail = Sail({ 
  subsets: ["latin"], 
  weight: "400" 
});
export const arimo = Arimo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], 
});
export const wallpoet = Wallpoet({
  subsets: ["latin"],
  weight: "400",
});