import "./globals.css";
import { Inter } from "next/font/google";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { SWRConfig } from 'swr';
import { ToastContainer } from 'react-toastify';
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <SWRConfig value={{
          revalidateOnMount: true
        }}>
          <MantineProvider>{children}</MantineProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
