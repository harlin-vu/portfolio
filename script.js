/**
 * HARLIN VU (HUONG LINH VU) | EDITORIAL 3D & PROJECT SHOWCASE ENGINE
 * - Full-Screen Three.js 3D Celestial Floating Island Hero
 * - Interactive 3D Landmarks with Raycaster Hover & Tooltips
 * - Dynamic Category Project Filter (All, AI, ESG, Business Architecture, Leadership)
 * - Dual Lighting Modes (Matcha Sunset / Cosmic Starlight)
 * - Bilingual Language Switcher (ENG / VIE)
 * - Single-Page View Routing for all 10 Project Deep Dives
 * - Animated Metric Counters & Interactive Ripple Feedback
 */

// ==========================================================================
// 1. STATE & LANGUAGE CONFIGURATION
// ==========================================================================
let currentLang = 'en';
let isCosmicMode = false;
let isCinematicTour = false;

const typingRoles = {
    en: [
        "Business Analyst & Data Storyteller",
        "Healthcare AI & Product Innovator",
        "SDG Policy & ESG Sustainability Consultant",
        "UML Enterprise Systems Architect",
        "Deep Learning & NLP Practitioner"
    ],
    vi: [
        "Chuyên Gia Phân Tích Kinh Doanh",
        "Kể Chuyện Dữ Liệu & Hoạch Định Chiến Lược",
        "Nhà Đổi Mới AI Y Tế & Trợ Lý Giọng Nói",
        "Tư Vấn Chính Sách SDG & Bền Vững Chuẩn GRI",
        "Kiến Trúc Sư Hệ Thống Doanh Nghiệp & UML"
    ]
};

let roleIdx = 0;
let charIdx = 0;
let isDeleting = false;
let typeTimer = null;

// ==========================================================================
// 2. DYNAMIC HERO TYPING ANIMATION
// ==========================================================================
function runTypingAnimation() {
    const textEl = document.getElementById("typing-role-text");
    if (!textEl) return;

    const roles = typingRoles[currentLang] || typingRoles.en;
    const targetStr = roles[roleIdx % roles.length];

    if (isDeleting) {
        charIdx--;
        textEl.textContent = targetStr.substring(0, charIdx);
    } else {
        charIdx++;
        textEl.textContent = targetStr.substring(0, charIdx);
    }

    let speed = isDeleting ? 25 : 55;

    if (!isDeleting && charIdx === targetStr.length) {
        speed = 1800;
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx++;
        speed = 350;
    }

    clearTimeout(typeTimer);
    typeTimer = setTimeout(runTypingAnimation, speed);
}

// ==========================================================================
// 3. THREE.JS 3D SPACE OASIS SCENE
// ==========================================================================
let oasisScene, oasisCamera, oasisRenderer, oasisGroup;
let ambientLight, dirLight1, dirLight2, islandPointLight;
let interactiveObjects = [];
let hoveredObject = null;
let raycaster, mouseVector;
let isDraggingOasis = false, prevMouseX = 0, prevMouseY = 0;
let targetRotX = 0.22, targetRotY = -0.35;
let islandRing, treeLeaves = [], steamParticles = [], stardustCubes = [];

function tryInitSpaceOasis(attempts = 0) {
    if (typeof THREE === 'undefined') {
        if (attempts < 25) {
            setTimeout(() => tryInitSpaceOasis(attempts + 1), 120);
        } else {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js";
            script.onload = () => initSpaceOasis();
            document.head.appendChild(script);
        }
        return;
    }
    initSpaceOasis();
}

function initSpaceOasis() {
    const container = document.getElementById("space-oasis-section");
    const canvas = document.getElementById("oasis-webgl-canvas");
    if (!container || !canvas || typeof THREE === 'undefined') return;

    const width = container.clientWidth || window.innerWidth || 1200;
    const height = container.clientHeight || window.innerHeight || 800;

    oasisScene = new THREE.Scene();
    oasisCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    oasisCamera.position.set(0, 4.8, 10.8);
    oasisCamera.lookAt(0, 0.3, 0);

    oasisRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    oasisRenderer.setSize(width, height);
    oasisRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    oasisRenderer.shadowMap.enabled = true;
    oasisRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    ambientLight = new THREE.AmbientLight(0xFFF7E6, 0.9);
    oasisScene.add(ambientLight);

    dirLight1 = new THREE.DirectionalLight(0xFEE78B, 1.5);
    dirLight1.position.set(8, 14, 8);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    oasisScene.add(dirLight1);

    dirLight2 = new THREE.DirectionalLight(0x84C98D, 1.0);
    dirLight2.position.set(-8, -6, -4);
    oasisScene.add(dirLight2);

    islandPointLight = new THREE.PointLight(0xD57530, 1.4, 20);
    islandPointLight.position.set(0, 2, 0);
    oasisScene.add(islandPointLight);

    oasisGroup = new THREE.Group();
    oasisScene.add(oasisGroup);

    buildFloatingIsland();
    buildLandmarks();
    buildCosmicAtmosphere();

    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    canvas.addEventListener("mousedown", (e) => {
        isDraggingOasis = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        isCinematicTour = false;
    });

    window.addEventListener("mouseup", () => {
        isDraggingOasis = false;
    });

    window.addEventListener("mousemove", onOasisMouseMove);
    canvas.addEventListener("click", onOasisClick);

    let touchStartX = 0, touchStartY = 0;
    canvas.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            isDraggingOasis = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isCinematicTour = false;
        }
    });

    canvas.addEventListener("touchmove", (e) => {
        if (!isDraggingOasis || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        targetRotY += deltaX * 0.006;
        targetRotX += deltaY * 0.006;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener("touchend", () => {
        isDraggingOasis = false;
    });

    window.addEventListener("resize", () => {
        if (!container) return;
        const newW = container.clientWidth || window.innerWidth;
        const newH = container.clientHeight || window.innerHeight;
        oasisCamera.aspect = newW / newH;
        oasisCamera.updateProjectionMatrix();
        oasisRenderer.setSize(newW, newH);
    });

    animateSpaceOasis();
}

function buildFloatingIsland() {
    const terrainGeo = new THREE.CylinderGeometry(3.6, 3.2, 0.7, 32);
    const terrainMat = new THREE.MeshStandardMaterial({
        color: 0x84C98D,
        roughness: 0.35,
        metalness: 0.1
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.y = 0;
    terrain.receiveShadow = true;
    oasisGroup.add(terrain);

    const rockGeo = new THREE.ConeGeometry(3.2, 3.4, 16);
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x6E4933,
        roughness: 0.85,
        metalness: 0.1
    });
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.rotation.x = Math.PI;
    rock.position.y = -2.0;
    oasisGroup.add(rock);

    const ringGeo = new THREE.TorusGeometry(4.8, 0.08, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0xFEE78B,
        metalness: 0.6,
        roughness: 0.2
    });
    islandRing = new THREE.Mesh(ringGeo, ringMat);
    islandRing.rotation.x = Math.PI / 2.3;
    oasisGroup.add(islandRing);
}

function buildLandmarks() {
    // 1. Data Terminal (Exhibit 07: House Price Deep Learning)
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-1.6, 0.45, 1.2);
    laptopGroup.userData = {
        name: "Deep Learning Station (House Price NN4)",
        nameVi: "Trạm Học Sâu (Định Giá Nhà NN4)",
        targetId: "project-house",
        originalScale: 1
    };
    const deskGeo = new THREE.BoxGeometry(1.1, 0.1, 0.75);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xD57530, roughness: 0.4 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.receiveShadow = true;
    laptopGroup.add(desk);

    const baseGeo = new THREE.BoxGeometry(0.55, 0.04, 0.4);
    const techMat = new THREE.MeshStandardMaterial({ color: 0x2A3B4C, metalness: 0.5 });
    const laptopBase = new THREE.Mesh(baseGeo, techMat);
    laptopBase.position.set(0, 0.07, 0);
    laptopGroup.add(laptopBase);

    const screenGeo = new THREE.BoxGeometry(0.55, 0.38, 0.03);
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x3B82F6,
        emissive: 0x1E40AF,
        emissiveIntensity: 0.8
    });
    const laptopScreen = new THREE.Mesh(screenGeo, screenMat);
    laptopScreen.position.set(0, 0.26, -0.18);
    laptopScreen.rotation.x = -0.25;
    laptopGroup.add(laptopScreen);

    oasisGroup.add(laptopGroup);
    interactiveObjects.push(laptopGroup);

    // 2. Health Clinic Beacon (Exhibit 01: AfterCare Voice AI)
    const medicalGroup = new THREE.Group();
    medicalGroup.position.set(1.5, 0.45, 1.1);
    medicalGroup.userData = {
        name: "Clinical Voice AI Beacon (AfterCare)",
        nameVi: "Tháp AI Giọng Nói Y Tế (AfterCare App)",
        targetId: "project-aftercare",
        originalScale: 1
    };
    const podGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.9, 20);
    const podMat = new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.2 });
    const pod = new THREE.Mesh(podGeo, podMat);
    medicalGroup.add(pod);

    const crossMat = new THREE.MeshStandardMaterial({ color: 0xE63946, emissive: 0xE63946, emissiveIntensity: 0.6 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), crossMat);
    crossV.position.set(0, 0.1, 0.42);
    medicalGroup.add(crossV);

    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.12), crossMat);
    crossH.position.set(0, 0.1, 0.42);
    medicalGroup.add(crossH);

    oasisGroup.add(medicalGroup);
    interactiveObjects.push(medicalGroup);

    // 3. Ancient Wisdom Pagoda (Exhibit 02: Tsinghua SDG & Pilbara Biodiversity)
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-1.4, 0.35, -1.3);
    treeGroup.userData = {
        name: "Biodiversity Governance Sanctuary (Tsinghua SDG)",
        nameVi: "Khu Bảo Tồn Đa Dạng Sinh Học (Tsinghua SDG)",
        targetId: "project-tsinghua",
        originalScale: 1
    };
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 1.2, 10);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5C3822 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.6;
    treeGroup.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5A8E63, roughness: 0.3 });
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.9, 8), leafMat);
    c1.position.y = 1.3;
    treeGroup.add(c1);
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.8, 8), leafMat);
    c2.position.y = 1.8;
    treeGroup.add(c2);
    const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 8), leafMat);
    c3.position.y = 2.2;
    treeGroup.add(c3);

    oasisGroup.add(treeGroup);
    interactiveObjects.push(treeGroup);

    // 4. Circular Enterprise Architecture (Exhibit 05: Sustainable Outdoor UML System)
    const archGroup = new THREE.Group();
    archGroup.position.set(1.4, 0.35, -1.3);
    archGroup.userData = {
        name: "Enterprise UML & Domain Architecture (MIS201)",
        nameVi: "Kiến Trúc Miền & UML Hệ Thống (MIS201)",
        targetId: "project-outdoor-system",
        originalScale: 1
    };
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xD57530, roughness: 0.3, metalness: 0.3 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.3, 12), pillarMat);
    p1.position.set(-0.35, 0.65, 0);
    archGroup.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.3, 12), pillarMat);
    p2.position.set(0.35, 0.65, 0);
    archGroup.add(p2);

    const beamGeo = new THREE.BoxGeometry(1.0, 0.15, 0.25);
    const beam = new THREE.Mesh(beamGeo, pillarMat);
    beam.position.set(0, 1.35, 0);
    archGroup.add(beam);

    oasisGroup.add(archGroup);
    interactiveObjects.push(archGroup);

    // 5. Central Zen Tea Kettle
    const teaGroup = new THREE.Group();
    teaGroup.position.set(0, 0.35, 0);
    teaGroup.userData = {
        name: "Creator's Zen Table",
        nameVi: "Bàn Trà Không Gian & Triết Lý Sáng Tạo",
        targetId: "about",
        originalScale: 1
    };
    const tableGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.15, 24);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xD57530, roughness: 0.4 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 0.25;
    teaGroup.add(table);

    const potGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0x4A6B82, roughness: 0.2 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(0, 0.45, 0);
    teaGroup.add(pot);

    for (let i = 0; i < 6; i++) {
        const steamGeo = new THREE.SphereGeometry(0.04 + i * 0.012, 8, 8);
        const steamMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 - i * 0.06 });
        const sp = new THREE.Mesh(steamGeo, steamMat);
        sp.position.set((Math.random() - 0.5) * 0.08, 0.65 + i * 0.1, (Math.random() - 0.5) * 0.08);
        sp.userData = { initialY: 0.65 + i * 0.1, speed: 0.003 + Math.random() * 0.002 };
        teaGroup.add(sp);
        steamParticles.push(sp);
    }

    oasisGroup.add(teaGroup);
    interactiveObjects.push(teaGroup);
}

function buildCosmicAtmosphere() {
    const starGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const colors = [0xFEE78B, 0x84C98D, 0xD57530, 0x60A5FA];

    for (let i = 0; i < 28; i++) {
        const starMat = new THREE.MeshStandardMaterial({
            color: colors[i % colors.length],
            emissive: colors[i % colors.length],
            emissiveIntensity: 0.4
        });
        const star = new THREE.Mesh(starGeo, starMat);
        const radius = 4.2 + Math.random() * 3.5;
        const angle = Math.random() * Math.PI * 2;
        const height = -1.5 + Math.random() * 4.5;
        star.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
        star.userData = {
            radius: radius,
            angle: angle,
            speed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
            rotSpeed: Math.random() * 0.03,
            height: height
        };
        oasisGroup.add(star);
        stardustCubes.push(star);
    }
}

function onOasisMouseMove(e) {
    const canvas = document.getElementById("oasis-webgl-canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (isDraggingOasis) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.006;
        targetRotX += deltaY * 0.006;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }

    mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (!oasisCamera || !raycaster) return;

    raycaster.setFromCamera(mouseVector, oasisCamera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    const tooltip = document.getElementById("oasis-3d-tooltip");

    if (intersects.length > 0) {
        let hitGroup = intersects[0].object;
        while (hitGroup.parent && !hitGroup.userData.targetId) {
            hitGroup = hitGroup.parent;
        }

        if (hitGroup && hitGroup.userData.targetId) {
            if (hoveredObject !== hitGroup) {
                if (hoveredObject) resetObjectScale(hoveredObject);
                hoveredObject = hitGroup;
                hoveredObject.scale.set(1.12, 1.12, 1.12);
            }

            if (tooltip) {
                const label = currentLang === 'vi' ? hoveredObject.userData.nameVi : hoveredObject.userData.name;
                tooltip.textContent = `✨ ${label} (Click to open)`;
                tooltip.style.left = `${e.clientX + 16}px`;
                tooltip.style.top = `${e.clientY + 16}px`;
                tooltip.classList.add("active");
            }
            document.body.style.cursor = "pointer";
            return;
        }
    }

    if (hoveredObject) {
        resetObjectScale(hoveredObject);
        hoveredObject = null;
        if (tooltip) tooltip.classList.remove("active");
        document.body.style.cursor = "default";
    }
}

function resetObjectScale(obj) {
    obj.scale.set(1, 1, 1);
}

function onOasisClick() {
    if (hoveredObject) {
        const targetId = hoveredObject.userData.targetId;
        if (targetId.startsWith("project-")) {
            showProject(targetId.replace("project-", ""));
        } else if (targetId === "about") {
            showHome("#about");
        }
    }
}

function toggleCosmicMode() {
    isCosmicMode = !isCosmicMode;
    const section = document.getElementById("space-oasis-section");
    const modeBtn = document.getElementById("btn-oasis-mode");

    if (isCosmicMode) {
        section.classList.add("cosmic-mode");
        modeBtn.innerHTML = "☀️ Matcha Sunset";
        ambientLight.color.setHex(0x3B526B);
        dirLight1.color.setHex(0x84C98D);
        dirLight2.color.setHex(0xFEE78B);
        islandPointLight.color.setHex(0x60A5FA);
    } else {
        section.classList.remove("cosmic-mode");
        modeBtn.innerHTML = "🌌 Cosmic Starlight";
        ambientLight.color.setHex(0xFFF7E6);
        dirLight1.color.setHex(0xFEE78B);
        dirLight2.color.setHex(0x84C98D);
        islandPointLight.color.setHex(0xD57530);
    }
}

function startCinematicTour() {
    isCinematicTour = !isCinematicTour;
    const tourBtn = document.getElementById("btn-oasis-tour");
    if (tourBtn) {
        tourBtn.innerHTML = isCinematicTour ? "⏹️ Pause Tour" : "🎬 360° Tour";
    }
}

function animateSpaceOasis() {
    requestAnimationFrame(animateSpaceOasis);

    if (isCinematicTour) {
        targetRotY += 0.008;
    }

    if (oasisGroup) {
        oasisGroup.rotation.y += (targetRotY - oasisGroup.rotation.y) * 0.06;
        oasisGroup.rotation.x += (targetRotX - oasisGroup.rotation.x) * 0.06;
        oasisGroup.rotation.x = Math.max(-0.2, Math.min(0.6, oasisGroup.rotation.x));
        oasisGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.15;
    }

    if (islandRing) {
        islandRing.rotation.z += 0.003;
    }

    steamParticles.forEach(p => {
        p.position.y += p.userData.speed;
        if (p.position.y > 1.1) {
            p.position.y = p.userData.initialY;
        }
    });

    stardustCubes.forEach(cube => {
        cube.userData.angle += cube.userData.speed;
        cube.position.x = Math.cos(cube.userData.angle) * cube.userData.radius;
        cube.position.z = Math.sin(cube.userData.angle) * cube.userData.radius;
        cube.position.y = cube.userData.height + Math.sin(cube.userData.angle * 2) * 0.3;
        cube.rotation.x += cube.userData.rotSpeed;
        cube.rotation.y += cube.userData.rotSpeed;
    });

    if (oasisRenderer && oasisScene && oasisCamera) {
        oasisRenderer.render(oasisScene, oasisCamera);
    }
}

// ==========================================================================
// 4. CATEGORY PROJECT FILTERING SYSTEM
// ==========================================================================
function filterProjects(category) {
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        if (pill.getAttribute('data-category') === category) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });

    const cards = document.querySelectorAll('.editorial-project-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 20);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 250);
        }
    });
}

// ==========================================================================
// 5. BILINGUAL LANGUAGE SWITCHER (ENG / VIE)
// ==========================================================================
function toggleLanguage() {
    currentLang = currentLang === 'vi' ? 'en' : 'vi';
    const langBtnText = document.getElementById('lang-btn-text');
    if (langBtnText) {
        langBtnText.innerText = currentLang === 'vi' ? 'ENG' : 'VIE';
    }

    const elements = document.querySelectorAll('[data-vi][data-en]');
    elements.forEach(el => {
        const translatedText = el.getAttribute(`data-${currentLang}`);
        if (translatedText) {
            el.innerHTML = translatedText;
        }
    });

    const docTitle = document.querySelector('title');
    if (docTitle) {
        const translatedTitle = docTitle.getAttribute(`data-${currentLang}`);
        if (translatedTitle) {
            document.title = translatedTitle;
        }
    }

    charIdx = 0;
    isDeleting = false;
    runTypingAnimation();
}

// ==========================================================================
// 6. SINGLE-PAGE VIEW ROUTING
// ==========================================================================
function showProject(projectId) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const target = document.getElementById(`project-${projectId}`);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        animateCounters(target);
    }
}

function showHome(targetAnchor) {
    const sections = document.querySelectorAll('.view-section');
    sections.forEach(sec => sec.classList.remove('active'));

    const homeView = document.getElementById('home-view');
    if (homeView) {
        homeView.classList.add('active');

        if (targetAnchor) {
            setTimeout(() => {
                const el = document.querySelector(targetAnchor);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function enterPortfolio() {
    const target = document.getElementById("main-portfolio-content");
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================================================
// 7. ANIMATED MILESTONE COUNTERS
// ==========================================================================
function animateCounters(container) {
    if (!container) return;
    const counters = container.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-count');
        let count = 0;
        const speed = Math.max(1, target / 25);
        const updateCount = () => {
            count += speed;
            if (count < target) {
                counter.innerText = Math.ceil(count).toLocaleString();
                setTimeout(updateCount, 25);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        updateCount();
    });
}

// ==========================================================================
// 8. TOAST FEEDBACK & COPY EMAIL
// ==========================================================================
function copyEmail() {
    const email = "vuhuonglinh17@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = currentLang === 'vi' 
                ? `Đã sao chép: ${email}` 
                : `Copied to clipboard: ${email}`;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 2800);
        }
    }).catch(() => {
        prompt(currentLang === 'vi' ? "Sao chép email:" : "Copy email:", email);
    });
}

// ==========================================================================
// 9. CLICK RIPPLE EFFECT
// ==========================================================================
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('#space-oasis-section')) return;

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.pageX}px`;
    ripple.style.top = `${e.pageY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
});

// ==========================================================================
// 10. INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    runTypingAnimation();
    tryInitSpaceOasis();
    
    // Initial animate counters in home view if present
    const homeView = document.getElementById('home-view');
    if (homeView) {
        animateCounters(homeView);
    }
});
