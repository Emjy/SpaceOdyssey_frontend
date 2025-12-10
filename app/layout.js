import '../styles/globals.css';

export const metadata = {
  title: 'SpaceOdyssey',
  description: 'Explore the solar system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
