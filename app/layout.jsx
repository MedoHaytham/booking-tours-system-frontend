import { Lato } from "next/font/google";
import "./globals.css";

import StoreProvider from "../components/StoreProvider";
import { AlertProvider } from "../context/AlertContext";
import { SidebarProvider } from "../context/SidebarContext";
import Alert from "../components/Alert";
import AuthGate from "../components/AuthGate";

import Header from "../components/Header";
import Footer from "../components/Footer";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "700"],
  style: ["normal", "italic"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata = {
  title: {
    template: 'Natours | %s',
    default: 'Natours | Exciting tours for adventurous people',
  },
  description: 'Exciting tours for adventurous people',
  icons: { icon: '/img/favicon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lato.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AlertProvider>
            <SidebarProvider>
              <AuthGate>
                <Alert />
                <Header />
                {children}
                <Footer />
              </AuthGate>
            </SidebarProvider>
          </AlertProvider>
        </StoreProvider>
      </body>
    </html>
  );
}