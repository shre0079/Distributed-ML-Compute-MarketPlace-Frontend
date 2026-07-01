import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="page">
      <Navbar />
      <main className="page__body app-body">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
