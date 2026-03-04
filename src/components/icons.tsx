import { Github, GitFork, FileText, Database, BrainCircuit, Search, Loader2, Sun, Moon, Home } from 'lucide-react';

export const Icons = {
  Logo: BrainCircuit,
  GitHub: Github,
  GitLab: GitFork,
  Codeberg: GitFork,
  Gitea: GitFork,
  GenericRepo: GitFork,
  Paper: FileText,
  Dataset: Database,
  Search: Search,
  Spinner: Loader2,
  Sun,
  Moon,
  Home,
};

/** Returns the appropriate icon component for a given repository source string */
export function getSourceIcon(source: string) {
  switch (source) {
    case 'GitHub': return Icons.GitHub;
    case 'GitLab': return Icons.GitLab;
    case 'Codeberg': return Icons.Codeberg;
    case 'Gitea': return Icons.Gitea;
    default: return Icons.GenericRepo;
  }
}

/** Returns a Tailwind color class for a given source badge */
export function getSourceColor(source: string): string {
  switch (source) {
    case 'GitHub': return 'bg-gray-800 text-white';
    case 'GitLab': return 'bg-orange-600 text-white';
    case 'Codeberg': return 'bg-teal-600 text-white';
    case 'Gitea': return 'bg-green-700 text-white';
    default: return 'bg-slate-500 text-white';
  }
}
