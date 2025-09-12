import { Github } from "lucide-react";

const PROJECT_REPO_URL = "https://github.com/Tuguberk/MicroCode-Checker";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-neutral-200">
      <div className="container mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-neutral-900 font-medium">Tuğberk Akbulut</div>

        <div className="flex items-center gap-2 text-neutral-600">
          <a
            href="https://x.com/tuguberk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 hover:underline"
          >
            @tuguberk
          </a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={PROJECT_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-neutral-900 hover:underline"
          >
            <Github className="w-4 h-4" aria-hidden="true" />
            Proje GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
