export type Paper = {
    title: string;
    authors: string[];
    source: string;
    url: string;
    description: string;
};

export type Repository = {
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stars: number;
    source: string; // e.g. "GitHub" | "GitLab" | "Bitbucket" | "Codeberg" | "Gitea" | "Launchpad" | "AI Suggested"
};
