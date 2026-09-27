async function loadPortfolioData(path) {
    const response = await fetch(path, { cache: "no-cache" });
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
        const categoryIcons = {
            "web development": "fa-solid fa-code",
            networking: "fa-solid fa-network-wired",
            cybersecurity: "fa-solid fa-shield-halved",
            iot: "fa-solid fa-microchip",
            tools: "fa-solid fa-screwdriver-wrench",
            design: "fa-solid fa-pen-ruler"
        };
        const groups = new Map();

        skills.forEach((skill) => {
            const category = String(skill.category || "Other").trim() || "Other";
            const name = String(skill.name || "").trim();
            if (!name) return;
            if (!groups.has(category)) groups.set(category, []);
            groups.get(category).push(name);
        });

        const cards = [...groups].map(([category, names]) => {
            const card = document.createElement("article");
            card.className = "skill-category";

            const heading = document.createElement("h2");
            heading.className = "skill-category-title";

            const icon = document.createElement("i");
            icon.className = categoryIcons[category.toLowerCase()] || "fa-solid fa-layer-group";
            icon.setAttribute("aria-hidden", "true");
            const title = document.createElement("span");
            title.textContent = category;
            heading.append(icon, title);

            const list = document.createElement("ul");
            list.className = "skill-tags";
            names.forEach((name) => {
                const item = document.createElement("li");
                item.textContent = name;
                list.append(item);
            });

            card.append(heading, list);
            return card;
        });

        container.replaceChildren(...cards);
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

