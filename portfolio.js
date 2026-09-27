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
        if (!Array.isArray(projects)) throw new Error("Project data must be a list");

        const splitItems = (value) => String(value || "")
            .split(/[\n;]/)
            .map((item) => item.trim())
            .filter(Boolean);

        const addTextSection = (parent, headingText, text) => {
            if (!text) return;
            const section = document.createElement("section");
            section.className = "case-study-detail";
            const heading = document.createElement("h4");
            heading.textContent = headingText;
            const paragraph = document.createElement("p");
            paragraph.textContent = text;
            section.append(heading, paragraph);
            parent.append(section);
        };

        const addListSection = (parent, headingText, values, className = "") => {
            const items = splitItems(values);
            if (!items.length) return;
            const section = document.createElement("section");
            section.className = `case-study-detail ${className}`.trim();
            const heading = document.createElement("h4");
            heading.textContent = headingText;
            const list = document.createElement("ul");
            items.forEach((value) => {
                const item = document.createElement("li");
                item.textContent = value;
                list.append(item);
            });
            section.append(heading, list);
            parent.append(section);
        };

        const cards = projects.map((project, index) => {
            const card = document.createElement("article");
            card.className = "case-study";

            const media = document.createElement("div");
            media.className = "case-study-media";
            if (project.image) {
                const image = document.createElement("img");
                image.src = project.image;
                image.alt = project.imageAlt || project.title || "Project image";
                image.loading = "lazy";
                image.decoding = "async";
                media.append(image);
            } else {
                media.classList.add("case-study-media-empty");
                media.setAttribute("aria-hidden", "true");
            }

            const content = document.createElement("div");
            content.className = "case-study-content";
            const eyebrow = document.createElement("p");
            eyebrow.className = "case-study-eyebrow";
            eyebrow.textContent = `CASE STUDY ${String(index + 1).padStart(2, "0")}`;
            const title = document.createElement("h3");
            title.textContent = project.title || "Untitled project";
            content.append(eyebrow, title);

            const details = document.createElement("div");
            details.className = "case-study-grid";
            addTextSection(details, "Problem", project.problem);
            addTextSection(details, "Solution", project.solution);
            addListSection(details, "Technologies", project.technologies, "case-study-tags-section");
            addListSection(details, "What I implemented", project.implemented);
            content.append(details);

            addTextSection(content, "My role", project.role);

            const evidenceItems = [
                ["demo", "View demo"],
                ["github", "GitHub"],
                ["diagram", "View network diagram"],
                ["packetTracerFile", "Packet Tracer file"]
            ];
            const evidenceLinks = evidenceItems
                .map(([key, label]) => ({ url: safeProjectUrl(project[key]), label }))
                .filter((item) => item.url);
            if (evidenceLinks.length) {
                const evidence = document.createElement("div");
                evidence.className = "case-study-evidence";
                const heading = document.createElement("h4");
                heading.textContent = "Evidence";
                const links = document.createElement("div");
                links.className = "evidence-links";
                evidenceLinks.forEach(({ url, label }) => {
                    const link = document.createElement("a");
                    link.href = url;
                    link.textContent = label;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    links.append(link);
                });
                evidence.append(heading, links);
                content.append(evidence);
            }

            card.append(media, content);
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

