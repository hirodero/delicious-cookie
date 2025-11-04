import "./globals.css";
import { FlickeringGrid } from "./components/ui/flickering-grid";
import { wallpoet,arimo, sail } from "@/app/font";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${wallpoet.className} bg-amber-900 lg:fixed lg:inset-0`}>
        <div className="overflow-y-auto bg-radial scroll-hide w-full h-dvh flex flex-col bg-cover">
            <FlickeringGrid
                className="absolute inset-0 animate-pulse -z-10"
                squareSize={7}
                gridGap={6}
                flickerChance={0.3}
                color="rgb(255, 255, 255)"
                maxOpacity={0.2}
            />
            <main className="h-dvh">
                {children}
            </main>
        </div>
      </body>
    </html>
  );
}
