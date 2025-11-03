import "./globals.css";
import { FlickeringGrid } from "./components/ui/flickering-grid";
import { wallpoet,arimo, sail } from "@/app/font";
import {AuthProvider} from './context/auth'
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${wallpoet.className} bg-black lg:fixed lg:inset-0`}>
        <div className="overflow-y-auto bg-radial scroll-hide w-full h-dvh flex flex-col bg-cover fixed inset-0">
            <FlickeringGrid
                className="absolute inset-0 animate-pulse -z-10"
                squareSize={7}
                gridGap={6}
                flickerChance={0.3}
                color="rgb(255, 255, 0)"
                maxOpacity={0.2}
            />
            <main className="h-dvh">
              <AuthProvider>
                {children}
              </AuthProvider>
            </main>
        </div>
      </body>
    </html>
  );
}
