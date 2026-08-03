interface FooterProps {
  fullName: string;
}

export function Footer({ fullName }: FooterProps) {
  return (
    <footer className="border-t border-slate-800 py-8 mt-16">
      <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
