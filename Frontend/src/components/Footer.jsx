export default function Footer() {
    return (
      <footer className="bg-blue-400 mt-auto">
        <p className="text-center text-white font-medium text-xs py-4">
          © {new Date().getFullYear()} CTS Lab CoE · Global LIMS UAR Platform
        </p>
      </footer>
    );
  }