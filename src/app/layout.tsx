'use client';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>StudyPlan AI - Planos de Estudo Inteligentes</title>
        <meta name="description" content="Crie planos de estudo personalizados com IA baseados em editais de concursos" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}