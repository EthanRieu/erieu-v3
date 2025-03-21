<template>
    <Header />
    <div class="flex flex-col items-center">
        <div class="w-full max-w-7xl">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1500 500"
                shape-rendering="geometricPrecision" text-rendering="geometricPrecision">

                <!-- ERIEU Text -->
                <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75" font-weight="800"
                    transform="matrix(5 0 0 5 109.262384 384.859102)" class="theme-text" stroke-width="0">
                    <tspan y="0" font-weight="800" stroke-width="0">ERIEU</tspan>
                </text>

                <!-- TM Text -->
                <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75" font-weight="800"
                    transform="translate(1266.074934 142.194716)" class="theme-text" stroke-width="0">
                    <tspan y="0" font-weight="800" stroke-width="0">TM</tspan>
                </text>
            </svg>
        </div>
        <div class="line-container relative w-full">
            <svg class="svg-container h-auto" viewBox="0 0 1839 887" preserveAspectRatio="xMidYMid meet" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path ref="path"
                    d="M1823.5 15C1823.5 15 1723.5 45 1623.5 115C1523.5 185 1473.5 245 1423.5 315C1373.5 385 1353.5 445 1373.5 515C1393.5 585 1443.5 615 1523.5 615C1603.5 615 1650 596 1680 526C1710 456 1693.5 385 1623.5 315C1553.5 245 1473.5 215 1373.5 215C1273.5 215 1173.5 245 1073.5 315C973.5 385 935.286 426 871 516C806.714 606 812.45 593.341 776 633C734.641 678 679.5 731.5 635.5 762C599.034 787.277 540.147 813.097 503.5 808C468.481 803.13 449.705 785.782 434 767.98C415.845 747.402 403.5 726.398 371.5 723C322.568 717.804 279.5 746.5 234.5 774.138C189.5 801.776 187.847 801.112 160 816C138.475 827.508 100.783 841.242 78 850C53.7348 859.328 39.9052 864.048 15 871.5"
                    stroke="url(#paint0_linear_14_78)" stroke-width="30" stroke-linecap="round"
                    class="invisible-path" />
                <defs>
                    <linearGradient id="paint0_linear_14_78" x1="1823.5" y1="14.9984" x2="123.498" y2="314.999"
                        gradientUnits="userSpaceOnUse">
                        <stop id="svg-gradient-start" />
                        <stop id="svg-gradient-end" offset="1" />
                    </linearGradient>
                </defs>
            </svg>

            <!-- Presentation Section -->
            <div class="p-8 sm:p-24 space-y-16">
                <div class="text-2xl sm:text-3xl md:text-4xl xl:text-6xl md:w-4/5 primary-color reveal-text">
                    Defining the digital future: shaping, developing
                    and expressing the essence of brands through
                    contemporary media
                </div>

                <!-- Conteneur flexible -->
                <div class="flex flex-col space-y-8 md:space-y-12 xl:flex-row xl:space-y-0 xl:space-x-16 items-center">
                    <!-- Conteneur de la box graphique avec Vanilla Tilt -->
                    <div class="w-full flex justify-center mb-8 xl:mb-0 reveal-element">
                        <div ref="tiltBox"
                            class="bg-gradient-to-br from-slate-200 to-slate-400 w-full sm:w-4/5 md:w-3/4 xl:w-full max-w-md h-48 sm:h-56 md:h-64 rounded-lg tilt-box">
                            <div
                                class="flex flex-col justify-center items-center h-full text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                                <span>Expérience interactive</span>
                                <div class="text-sm mt-2 text-gray-600">Survolez pour explorer</div>
                                <div
                                    class="absolute w-16 h-16 rounded-full bg-white/20 blur-xl transition-all duration-700 mix-blend-overlay">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contenu texte -->
                    <div
                        class="space-y-6 primary-color sm:space-y-8 md:space-y-10 text-base sm:text-lg md:text-xl xl:text-2xl">
                        <div class="font-semibold reveal-text-staggered">
                            The media world is constantly evolving, and digital
                            presence has become a fundamental pillar of business
                            success.
                        </div>
                        <div class="reveal-text-staggered">
                            Brands must continually evolve their strategy to maintain
                            their visibility and relevance in the modern media ecosystem.
                        </div>
                        <div class="reveal-text-staggered">
                            A robust and sophisticated web presence is no longer
                            simply an asset, but an absolute necessity to stand out
                            from the competition and establish a lasting connection
                            with your audience.
                        </div>
                        <div class="reveal-text-staggered">
                            In an age when consumers routinely begin their purchasing
                            journey online, having a professional and engaging digital
                            identity is the key to turning your visibility into concrete
                            business opportunities.
                        </div>
                        <div
                            class="font-semibold smooth-underline cursor-pointer w-fit reveal-text-staggered reveal-cta">
                            Learn more about our approach
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected projects section -->
            <div class="px-8 sm:px-24 py-16">
                <!-- Title -->
                <div
                    class="mb-16 secondary-color text-[80px] sm:text-[100px] md:text-[140px] lg:text-[170px] xl:text-[200px] font-bold tracking-tighter leading-[0.8] reveal-title">
                    Selected <br />
                    Works
                </div>
                <!-- Divider Component-->
                <div class="w-full h-[2px] divider my-8 reveal-divider"></div>

                <!-- Projects Components -->
                <div v-for="(project, index) in featuredProjects" :key="project.id" :class="'reveal-project-' + index">
                    <!-- Projet -->
                    <SelectedProject :id="project.id" :datePrincipal="project.datePrincipal" :annee="project.annee"
                        :services="project.services" :description="project.description" :titre="project.titre"
                        :imageUrl="project.imageUrl" secondaryColor="#2F4A4F" @project-click="navigateToProject" />

                    <div class="w-full h-[2px] divider lg:my-8 reveal-divider"></div>
                </div>

                <div class="flex justify-end w-9/10 mt-16">
                    <div class="primary-color text-5xl font-medium cursor-pointer w-fit smooth-underline-xl reveal-cta">
                        <NuxtLink to="/projects" class=" text-4xl sm:text-5xl md:text-6xl lg:text-7xl">-> See all
                            projects</NuxtLink>
                    </div>
                </div>

                <!-- About me Section -->
                <div class="flex my-46">
                    <div class="w-1/5">
                        <!-- SVG -->
                    </div>

                    <!-- Main Section -->
                    <div class="lg:w-4/5 flex flex-col items-start">
                        <div
                            class="secondary-color text-[60px] sm:text-[90px] md:text-[120px] lg:text-[150px] xl:text-[200px] font-bold leading-[0.8] reveal-title">
                            About me
                        </div>
                        <div
                            class="primary-color text-2xl sm:text-3xl md:text-4xl lg:text-6xl my-4 sm:my-8 lg:my-16 reveal-text">
                            I'm a creative full-stack developer and I train myself in the latest
                            technologies to create web applications that blend aesthetics,
                            interactivity and practicality.
                        </div>

                        <!-- Core tool section -->
                        <div class="primary-color grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            <div class="reveal-tool">
                                <div class="text-3xl md:text-4xl font-semibold mb-4">Nuxt.js</div>
                                <div>
                                    Nuxt.js is positioned as a sophisticated development framework for the creation
                                    of modern web applications, building on the power of Vue.js. It simplifies the
                                    implementation of advanced features such as static site generation, automated
                                    routing and performance optimization, enabling developers to create robust,
                                    scalable web experiences.
                                </div>
                            </div>
                            <div class="reveal-tool">
                                <div class="text-3xl md:text-4xl font-semibold mb-4">Node.js</div>
                                <div>
                                    Node.js is a server-side JavaScript runtime environment designed for
                                    scalable network applications. It enables the creation of fast, high-performance
                                    web applications thanks to its non-blocking architecture and vast ecosystem of
                                    modules.
                                </div>
                            </div>
                            <div class="reveal-tool">
                                <div class="text-3xl md:text-4xl font-semibold mb-4">GSAP</div>
                                <div>
                                    GSAP (GreenSock Animation Platform) has established itself as JavaScript
                                    library for the creation of high-performance web animations.
                                    It offers precise control over the animation of HTML elements, enabling
                                    smooth transitions and complex visual effects.
                                </div>
                            </div>
                            <div class="reveal-tool">
                                <div class="text-3xl md:text-4xl font-semibold mb-4">Figma</div>
                                <div>
                                    Figma has established itself as the benchmark platform for digital
                                    interface design and real-time collaboration. It offers powerful
                                    design and prototyping tools, enabling teams to create and share
                                    interactive mock-ups in an intuitive web interface.
                                </div>
                            </div>
                            <div class="reveal-tool">
                                <div class="text-3xl md:text-4xl font-semibold mb-4">TailwindCSS</div>
                                <div>
                                    TailwindCSS emerges as a utility-first CSS framework that revolutionizes web styling
                                    through its atomic approach. It provides a comprehensive set of pre-built classes
                                    for rapid interface development, enabling developers to design responsive layouts
                                    without leaving their HTML.
                                </div>
                            </div>
                            <div class="reveal-tool">
                                <div class="text-3xl md:text-4xl font-semibold mb-4">PostgreSQL</div>
                                <div>
                                    PostgreSQL stands as a robust open-source relational database management
                                    system known for its reliability and extensibility. It offers advanced data
                                    handling features like ACID compliance and complex queries, making it ideal for
                                    enterprise applications requiring data integrity.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Section -->
                <div class="mb-16">
                    <div
                        class="secondary-color text-[50px] sm:text-[80px] md:text-[110px] lg:text-[150px] xl:text-[200px] font-bold reveal-title">
                        Let's Work !
                    </div>
                    <div
                        class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold secondary-color cursor-pointer w-fit mb-4 sm:mb-8 md:mb-16 smooth-underline-xl reveal-cta">
                        <a href="mailto:contact@erieu.fr">contact@erieu.fr</a>
                    </div>
                    <div class="primary-color text-sm sm:text-md font-bold reveal-text">Currently available for <br />
                        freelance
                        projects</div>
                </div>

                <Footer />
            </div>
        </div>
    </div>
</template>

<script>
import Header from '~/components/header.vue'
import Footer from '~/components/footer.vue'
import SelectedProject from '~/components/SelectedProject.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { useProjectStore } from '~/stores/projectStore'

export default {
    components: {
        Header,
        SelectedProject,
        Footer
    },
    head() {
        return {
            script: [
                { src: 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.2/vanilla-tilt.min.js', body: true }
            ]
        }
    },
    data() {
        return {
            scrollClass: 'scroll-responsive',
            animationSettings: {
                mobile: {
                    start: "top 20%",
                    end: "top"
                },
                tablet: {
                    start: "top 40%",
                    end: "top"
                },
                desktop: {
                    start: "top 50%",
                    end: "top"
                }
            },
            currentAnimSettings: {
                start: "top 50%",
                end: "top"
            },
            scrollTriggerInstances: [], // Stocker toutes les instances pour un nettoyage facile
            isAnimationInitialized: false,
            tiltInstance: null, // Pour stocker l'instance de vanilla-tilt
        }
    },
    computed: {
        // Utiliser le store Pinia pour récupérer les projets mis en avant
        featuredProjects() {
            const projectStore = useProjectStore()
            return projectStore.getFeaturedProjects
        }
    },
    created() {
        // Configurer les projets à afficher sur la page d'accueil
        // Ces IDs sont définis dans le store, mais on pourrait aussi les définir ici
        /* 
        Exemple pour personnaliser les projets affichés :
        const projectStore = useProjectStore()
        projectStore.setFeaturedProjects(['projet-1', 'projet-3'])
        */
    },
    mounted() {
        // Enregistrer les plugins GSAP une seule fois
        if (process.client) {
            gsap.registerPlugin(ScrollTrigger, TextPlugin);

            // Utiliser le hook onMounted de Vue pour s'assurer que ça ne se lance qu'une fois
            this.$nextTick(() => {
                // Nettoyer tout d'abord
                this.cleanupAnimations();
                // Puis initialiser
                this.initializeAnimations();
                // Initialiser Vanilla Tilt
                this.initializeTilt();

                // Ajouter le gestionnaire d'événement resize
                window.addEventListener('resize', this.handleResize);
            });
        }
    },
    beforeDestroy() {
        // Nettoyer les événements et les ScrollTriggers
        this.cleanupAnimations();
        // Nettoyer vanilla-tilt
        this.cleanupTilt();
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        // Méthode pour naviguer vers la page détaillée d'un projet
        navigateToProject(projectId) {
            // Stocker l'ID du projet sélectionné dans le store Pinia
            const projectStore = useProjectStore()
            projectStore.selectProject(projectId)

            // Naviguer vers la page du projet
            this.$router.push(`/projets/${projectId}`);
        },

        // Initialiser vanilla-tilt
        initializeTilt() {
            if (!process.client) return;

            // S'assurer que VanillaTilt est chargé et que l'élément existe
            if (window.VanillaTilt && this.$refs.tiltBox) {
                // Détruire l'instance précédente si elle existe
                this.cleanupTilt();

                // Configurer vanilla-tilt avec un effet plus prononcé et un suivi de souris
                this.tiltInstance = window.VanillaTilt.init(this.$refs.tiltBox, {
                    max: 25,               // Inclinaison maximale augmentée pour plus de réactivité
                    speed: 300,            // Vitesse légèrement plus rapide pour un suivi plus réactif
                    glare: true,           // Activer l'effet de brillance
                    "max-glare": 0.6,      // Intensité de brillance augmentée
                    scale: 1.1,            // Effet de zoom plus prononcé
                    perspective: 1000,      // Perspective plus forte pour un effet 3D amélioré
                    transition: true,      // Animation de transition
                    gyroscope: true,       // Activer le gyroscope sur mobile
                    gyroscopeMinAngleX: -45, // Limites du gyroscope élargies
                    gyroscopeMaxAngleX: 45,  // pour plus d'effet sur mobile
                    gyroscopeMinAngleY: -45,
                    gyroscopeMaxAngleY: 45,
                    reset: true,           // Réinitialiser l'effet quand la souris quitte l'élément
                    mouse: true,           // Suivre la souris
                    "full-page-listening": false, // Limiter la détection aux mouvements sur l'élément
                    "mouse-event-element": this.$refs.tiltBox // Élément qui détecte les événements de souris
                });
            } else {
                // Si VanillaTilt n'est pas encore chargé, réessayer après un court délai
                setTimeout(() => {
                    this.initializeTilt();
                }, 500);
            }
        },

        // Nettoyer l'instance de vanilla-tilt
        cleanupTilt() {
            if (this.tiltInstance && this.tiltInstance.destroy) {
                this.tiltInstance.destroy();
                this.tiltInstance = null;
            }
        },

        initializeAnimations() {
            // Vérifier si on est côté client
            if (!process.client) return;

            // Vérifier si les animations sont déjà initialisées pour éviter la double initialisation
            if (this.isAnimationInitialized) {
                console.log('Animations already initialized, skipping');
                return;
            }

            console.log('Initializing animations');

            // Configuration responsive
            this.setupResponsive();

            // Pré-cacher tous les éléments animés avec GSAP pour éviter le flash
            this.preHideAnimatedElements();

            // Initialiser les animations en fonction de la taille de l'écran
            this.setupPathAnimation();
            this.initTextAnimations();

            this.isAnimationInitialized = true;
        },

        // Nouvelle méthode pour pré-cacher les éléments
        preHideAnimatedElements() {
            if (!process.client) return;

            // Cacher les éléments avec un titre de grand format
            gsap.set('.reveal-title', { y: 100, opacity: 0, skewY: 5 });

            // Cacher les textes
            gsap.set('.reveal-text', { y: 30, opacity: 0 });

            // Cacher les textes en cascade
            gsap.set('.reveal-text-staggered', { y: 20, opacity: 0 });

            // Cacher les dividers
            gsap.set('.reveal-divider', { scaleX: 0, transformOrigin: "left center" });

            // Cacher les éléments
            gsap.set('.reveal-element', { scale: 0.9, opacity: 0 });

            // Cacher les projets
            document.querySelectorAll('[class^="reveal-project-"]').forEach((project, index) => {
                gsap.set(project, { x: index % 2 === 0 ? -50 : 50, opacity: 0 });
            });

            // Cacher les outils
            gsap.set('.reveal-tool', { y: 30, opacity: 0 });

            // Cacher les CTA
            gsap.set('.reveal-cta', { y: 20, opacity: 0 });
        },

        // Nettoyer toutes les animations
        cleanupAnimations() {
            // Tuer toutes les instances ScrollTrigger
            if (this.scrollTriggerInstances && this.scrollTriggerInstances.length) {
                this.scrollTriggerInstances.forEach(instance => {
                    if (instance && instance.kill) {
                        instance.kill();
                    }
                });

                this.scrollTriggerInstances = [];
            }

            // Tuer tous les tweens
            gsap.killTweensOf("*");

            // Réinitialiser les données
            this.isAnimationInitialized = false;
        },

        // Gérer le redimensionnement
        handleResize() {
            // Débouncer pour éviter de multiples exécutions
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }

            this.resizeTimeout = setTimeout(() => {
                this.setupResponsive();
                this.refreshAnimation();
                // Réinitialiser vanilla-tilt pour s'adapter au nouveau format d'écran
                this.initializeTilt();
            }, 200);
        },

        setupResponsive() {
            if (!process.client) return;

            const width = window.innerWidth;

            // Mise à jour de la classe de scroll selon la taille d'écran
            if (width < 640) { // Mobile
                this.scrollClass = 'scroll-mobile';
                this.currentAnimSettings = this.animationSettings.mobile;
            } else if (width < 1024) { // Tablet
                this.scrollClass = 'scroll-tablet';
                this.currentAnimSettings = this.animationSettings.tablet;
            } else { // Desktop
                this.scrollClass = 'scroll-desktop';
                this.currentAnimSettings = this.animationSettings.desktop;
            }
        },

        // Configurer l'animation du chemin SVG
        setupPathAnimation() {
            if (!process.client) return;

            const path = this.$refs.path;
            if (!path) return;

            const pathLength = path.getTotalLength();

            // Configurer le chemin SVG pour l'animation
            gsap.set(path, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                opacity: 1
            });

            // Supprimer la classe invisible-path
            path.classList.remove('invisible-path');

            // Sur xl+, créer l'animation qui dessine le chemin au scroll
            if (window.innerWidth >= 1280) {
                this.setupScrollAnimation(path, pathLength);
            } else {
                // Sinon, lancer l'animation automatiquement
                this.playAutoAnimation(path, pathLength);
            }
        },

        playAutoAnimation(path, pathLength) {
            if (!path) return;

            // Animation automatique sans ScrollTrigger
            const tween = gsap.to(path, {
                strokeDashoffset: 0,
                duration: 2.5,
                ease: "power2.out"
            });
        },

        setupScrollAnimation(path, pathLength) {
            if (!path) return;

            // Créer une nouvelle animation avec les paramètres actuels
            const tween = gsap.to(path, {
                strokeDashoffset: 0,
                duration: 2,
                ease: "power2.out"
            });

            // Créer ScrollTrigger et stocker l'instance
            const instance = ScrollTrigger.create({
                animation: tween,
                trigger: ".line-container",
                start: this.currentAnimSettings.start,
                end: this.currentAnimSettings.end,
                scrub: 3,
                markers: false,
                onRefresh: self => {
                    if (self.progress === 0) {
                        gsap.set(path, {
                            strokeDashoffset: pathLength
                        });
                    }
                }
            });

            // Stocker l'instance pour nettoyage ultérieur
            this.scrollTriggerInstances.push(instance);
        },

        refreshAnimation() {
            if (!process.client) return;

            // Nettoyer et réinitialiser les animations
            this.cleanupAnimations();
            setTimeout(() => {
                this.initializeAnimations();
            }, 100);
        },

        // Initialiser toutes les animations de texte avec des protections contre les erreurs DOM
        initTextAnimations() {
            if (!process.client) return;

            // Exécuter les animations en séquence avec un délai
            setTimeout(() => {
                this.animateBigTitles();

                setTimeout(() => {
                    this.animateTexts();

                    setTimeout(() => {
                        this.animateStaggeredTexts();

                        setTimeout(() => {
                            this.animateDividers();

                            setTimeout(() => {
                                this.animateElements();

                                setTimeout(() => {
                                    this.animateProjects();

                                    setTimeout(() => {
                                        this.animateTools();

                                        setTimeout(() => {
                                            this.animateCTAs();
                                        }, 100);
                                    }, 100);
                                }, 100);
                            }, 100);
                        }, 100);
                    }, 100);
                }, 100);
            }, 100);
        },

        // Animation pour les grands titres (Selected Works, About me, Let's Work!)
        animateBigTitles() {
            if (!process.client) return;

            const titles = document.querySelectorAll('.reveal-title');
            if (!titles.length) return;

            titles.forEach(title => {
                if (!title) return;

                const instance = ScrollTrigger.create({
                    trigger: title,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.fromTo(title,
                            {
                                y: 100,
                                opacity: 0,
                                skewY: 5
                            },
                            {
                                y: 0,
                                opacity: 1,
                                skewY: 0,
                                duration: 1.2,
                                ease: "power3.out"
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);
            });
        },

        // Animation pour les textes standard
        animateTexts() {
            if (!process.client) return;

            const texts = document.querySelectorAll('.reveal-text');
            if (!texts.length) return;

            texts.forEach(text => {
                if (!text) return;

                const instance = ScrollTrigger.create({
                    trigger: text,
                    start: "top 90%",
                    onEnter: () => {
                        gsap.fromTo(text,
                            {
                                y: 30,
                                opacity: 0
                            },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.8,
                                ease: "power2.out"
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);
            });
        },

        // Animation pour les textes en cascade
        animateStaggeredTexts() {
            if (!process.client) return;

            const textGroups = document.querySelectorAll('.space-y-6, .space-y-8, .space-y-10');
            if (!textGroups.length) return;

            textGroups.forEach(group => {
                if (!group) return;

                const staggeredTexts = group.querySelectorAll('.reveal-text-staggered');
                if (!staggeredTexts.length) return;

                const instance = ScrollTrigger.create({
                    trigger: group,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.fromTo(staggeredTexts,
                            {
                                y: 20,
                                opacity: 0
                            },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 0.6,
                                stagger: 0.15,
                                ease: "power2.out"
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);
            });
        },

        // Animation pour les séparateurs
        animateDividers() {
            if (!process.client) return;

            const dividers = document.querySelectorAll('.reveal-divider');
            if (!dividers.length) return;

            dividers.forEach(divider => {
                if (!divider) return;

                const instance = ScrollTrigger.create({
                    trigger: divider,
                    start: "top 90%",
                    onEnter: () => {
                        gsap.fromTo(divider,
                            {
                                scaleX: 0,
                                transformOrigin: "left center"
                            },
                            {
                                scaleX: 1,
                                duration: 1,
                                ease: "power3.inOut"
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);
            });
        },

        // Animation pour les images et éléments visuels
        animateElements() {
            if (!process.client) return;

            const elements = document.querySelectorAll('.reveal-element');
            if (!elements.length) return;

            elements.forEach(element => {
                if (!element) return;

                const instance = ScrollTrigger.create({
                    trigger: element,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.fromTo(element,
                            {
                                scale: 0.9,
                                opacity: 0
                            },
                            {
                                scale: 1,
                                opacity: 1,
                                duration: 0.8,
                                ease: "back.out(1.5)",
                                onComplete: () => {
                                    // Une fois l'élément révélé, initialiser Vanilla Tilt
                                    // Cela s'applique spécifiquement aux éléments qui contiennent la classe tilt-box
                                    const tiltElement = element.querySelector('.tilt-box');
                                    if (tiltElement && window.VanillaTilt) {
                                        window.VanillaTilt.init(tiltElement, {
                                            max: 15,
                                            speed: 400,
                                            glare: true,
                                            "max-glare": 0.5,
                                            scale: 1.05
                                        });
                                    }
                                }
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);
            });
        },

        // Animation pour les projets
        animateProjects() {
            if (!process.client) return;

            const projects = document.querySelectorAll('[class^="reveal-project-"]');
            if (!projects.length) return;

            projects.forEach((project, index) => {
                if (!project) return;

                const instance = ScrollTrigger.create({
                    trigger: project,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.fromTo(project,
                            {
                                x: index % 2 === 0 ? -50 : 50,
                                opacity: 0
                            },
                            {
                                x: 0,
                                opacity: 1,
                                duration: 0.8,
                                ease: "power2.out"
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);
            });
        },

        // Animation pour les outils
        animateTools() {
            if (!process.client) return;

            const tools = document.querySelectorAll('.reveal-tool');
            if (!tools.length) return;

            const instance = ScrollTrigger.create({
                trigger: tools[0],
                start: "top 85%",
                onEnter: () => {
                    gsap.fromTo(tools,
                        {
                            y: 30,
                            opacity: 0
                        },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 0.6,
                            stagger: 0.1,
                            ease: "power2.out"
                        }
                    );
                },
                once: true
            });

            this.scrollTriggerInstances.push(instance);
        },

        // Animation pour les CTA
        animateCTAs() {
            if (!process.client) return;

            const ctas = document.querySelectorAll('.reveal-cta');
            if (!ctas.length) return;

            ctas.forEach(cta => {
                if (!cta) return;

                const instance = ScrollTrigger.create({
                    trigger: cta,
                    start: "top 90%",
                    onEnter: () => {
                        gsap.fromTo(cta,
                            {
                                y: 20,
                                opacity: 0
                            },
                            {
                                y: 0,
                                opacity: 1,
                                duration: 1,
                                ease: "back.out(1.7)"
                            }
                        );
                    },
                    once: true
                });

                this.scrollTriggerInstances.push(instance);

                // Ajouter les interactions au survol
                if (process.client) {
                    cta.addEventListener('mouseenter', () => {
                        gsap.to(cta, {
                            scale: 1.05,
                            duration: 0.3,
                            ease: "power1.out"
                        });
                    });

                    cta.addEventListener('mouseleave', () => {
                        gsap.to(cta, {
                            scale: 1,
                            duration: 0.3,
                            ease: "power1.out"
                        });
                    });
                }
            });
        }
    }
}
</script>

<style>
.line-container {
    width: 100%;
    overflow: hidden;
    position: relative;
}

/* Cette classe cache initialement le chemin SVG */
.invisible-path {
    visibility: hidden;
}

.svg-container {
    width: calc(100% + 20px);
    max-width: calc(100vw + 20px);
    margin-left: 0;
    margin-right: -10px;
}

/* Styles pour vanilla-tilt */
.tilt-box {
    transform-style: preserve-3d;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.tilt-box:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* Ajout d'un effet subtil de déplacement des éléments internes pour renforcer l'effet 3D */
.tilt-box>* {
    transform: translateZ(20px);
    transition: transform 0.3s ease;
}

/* Style pour l'effet de glare (brillance) */
.js-tilt-glare {
    border-radius: 8px;
}
</style>