async function loadPortfolioData(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Could not load ${path}`);
    }
    return response.json();
}

function showLoadError(container, message) {
    const notice = document.createElement("p");
    notice.className = "portfolio-load-error";
    notice.textContent = message;
    container.replaceChildren(notice);
}

function safeProjectUrl(value) {
    if (!value) return null;

    try {
        const url = new URL(value, window.location.href);
        if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch {
        return null;
    }

    return null;
}

async function renderProjects() {
    const container = document.querySelector("#project-list");
    if (!container) return;

    try {
        const projects = await loadPortfolioData("data/projects.json");
        const cards = projects.map((project) => {
            const card = document.createElement("article");
            card.className = "card";

            if (project.image) {
                const image = document.createElement("img");
                image.src = project.image;
                image.alt = project.imageAlt || project.title || "Project image";
                image.loading = "lazy";
                card.append(image);
            }

            const title = document.createElement("h3");
            title.textContent = project.title || "Untitled project";
            card.append(title);

            const description = document.createElement("p");
            description.textContent = project.description || "";
            card.append(description);

            const projectUrl = safeProjectUrl(project.link);
            if (projectUrl) {
                const link = document.createElement("a");
                link.href = projectUrl;
                link.textContent = "View project";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                card.append(link);
            }

            return card;
        });

        container.replaceChildren(...cards);
    } catch {
        showLoadError(container, "Projects are temporarily unavailable.");
    }
}

async function renderSkills() {
    const container = document.querySelector("#skill-list");
    if (!container) return;

    try {
        const skills = await loadPortfolioData("data/skills.json");
        const items = skills.map((skill) => {
            const row = document.createElement("div");
            row.className = "skill";

            const name = document.createElement("span");
            name.textContent = skill.name || "Skill";
            row.append(name);

            const bar = document.createElement("div");
            bar.className = "bar";
            bar.setAttribute("role", "progressbar");
            bar.setAttribute("aria-label", skill.name || "Skill level");
            bar.setAttribute("aria-valuemin", "0");
            bar.setAttribute("aria-valuemax", "100");

            const level = Math.max(0, Math.min(100, Number(skill.level) || 0));
            bar.setAttribute("aria-valuenow", String(level));

            const fill = document.createElement("div");
            fill.className = "fill";
            fill.style.width = `${level}%`;
            fill.textContent = `${level}%`;
            bar.append(fill);
            row.append(bar);

            return row;
        });

        container.replaceChildren(...items);
    } catch {
        showLoadError(container, "Skills are temporarily unavailable.");
    }
}

async function renderCvDownload() {
    const link = document.querySelector("#cv-download-link");
    if (!link) return;

    try {
        const settings = await loadPortfolioData("data/site.json");
        if (!settings.cvFile) return;

        const cvUrl = new URL(settings.cvFile, window.location.href);
        if (cvUrl.origin !== window.location.origin || !cvUrl.pathname.toLowerCase().endsWith(".pdf")) {
            return;
        }

        link.href = cvUrl.href;
        link.hidden = false;
    } catch {
        link.hidden = true;
    }
}

renderProjects();
renderSkills();
renderCvDownload();

