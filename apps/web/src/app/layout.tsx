import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Motion Anatomy", description: "교육용 3D 근골격계 움직임 아틀라스" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
