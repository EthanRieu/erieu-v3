<template>
    <Header />
    <div class="flex flex-col items-center">
        <img class="w-full max-w-7xl" src="/assets/img/logo.svg" alt="Logo ERIEU">
        <div class="line-container relative w-full">
            <!-- Placeholder text on the left -->
            <div class="absolute left-4 sm:left-12 md:left-24 lg:left-48 top-1/6 z-10">
                <div
                    class="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-sm sm:text-base md:text-lg text-black">
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Explicabo eos nulla minus animi ea ipsam
                    doloremque quam officia velit tempore culpa, natus laudantium similique ex eaque nisi beatae, sint
                    accusamus!
                </div>
            </div>

            <!-- SVG path with scroll indicator -->
            <svg class="svg-container h-auto" viewBox="0 0 1839 887" preserveAspectRatio="xMidYMid meet" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path ref="path"
                    d="M1823.5 15C1823.5 15 1723.5 45 1623.5 115C1523.5 185 1473.5 245 1423.5 315C1373.5 385 1353.5 445 1373.5 515C1393.5 585 1443.5 615 1523.5 615C1603.5 615 1650 596 1680 526C1710 456 1693.5 385 1623.5 315C1553.5 245 1473.5 215 1373.5 215C1273.5 215 1173.5 245 1073.5 315C973.5 385 935.286 426 871 516C806.714 606 812.45 593.341 776 633C734.641 678 679.5 731.5 635.5 762C599.034 787.277 540.147 813.097 503.5 808C468.481 803.13 449.705 785.782 434 767.98C415.845 747.402 403.5 726.398 371.5 723C322.568 717.804 279.5 746.5 234.5 774.138C189.5 801.776 187.847 801.112 160 816C138.475 827.508 100.783 841.242 78 850C53.7348 859.328 39.9052 864.048 15 871.5"
                    stroke="url(#paint0_linear_14_78)" stroke-width="30" stroke-linecap="round"
                    class="invisible-path" />
                <defs>
                    <linearGradient id="paint0_linear_14_78" x1="1823.5" y1="14.9984" x2="123.498" y2="314.999"
                        gradientUnits="userSpaceOnUse">
                        <stop stop-color="#2F4A4F" />
                        <stop offset="1" stop-color="#899EA2" />
                    </linearGradient>
                </defs>
            </svg>

            <!-- Scroll indicator text - position it with classes
            <div class="scroll-indicator absolute text-black text-xs sm:text-sm md:text-md" :class="scrollClass">
                (Scroll)
            </div> -->

            <!-- Presentation Section -->

            <div class="p-24 space-y-16">
                <div class="text-6xl w-4/5">
                    Defining the digital future: shaping, developing
                    and expressing the essence of brands through
                    contemporary media
                </div>
                <div class="flex flex-row justify-between space-x-64 items-center">
                    <div>
                        <!-- <img src="" alt=""> -->
                        <div class="bg-slate-300 w-114 h-64 rounded-lg"></div>
                    </div>
                    <div class="space-y-10 text-2xl">
                        <div class="font-semibold">
                            The media world is constantly evolving, and digital
                            presence has become a fundamental pillar of business
                            success.
                        </div>
                        <div>
                            Brands must continually evolve their strategy to maintain
                            their visibility and relevance in the modern media ecosystem.
                        </div>
                        <div>
                            A robust and sophisticated web presence is no longer
                            simply an asset, but an absolute necessity to stand out
                            from the competition and establish a lasting connection
                            with your audience.
                        </div>
                        <div>
                            In an age when consumers routinely begin their purchasing
                            journey online, having a professional and engaging digital
                            identity is the key to turning your visibility into concrete
                            business opportunities.
                        </div>
                        <div class="font-semibold underline cursor-pointer w-fit">
                            Learn more about our approach
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected projects section -->
            <div class="px-24 py-16">
                <!-- Title -->
                <div class="mb-16 secondary-color text-[200px] font-bold tracking-tighter leading-[0.8]">Selected <br />
                    Works
                </div>
                <!-- Divider Component-->
                <div class="w-full h-[2px] bg-secondary my-8"></div>

                <!-- Projects Components -->
                <div v-for="project in selectedProjects" :key="project.id">
                    <!-- Projet -->
                    <SelectedProject :id="project.id" :datePrincipal="project.datePrincipal" :annee="project.annee"
                        :services="project.services" :description="project.description" :titre="project.titre"
                        :imageUrl="project.imageUrl" secondaryColor="#2F4A4F" @project-click="navigateToProject" />

                    <div class="w-full h-[2px] bg-secondary my-8"></div>

                </div>

                <div class="flex justify-end w-9/10 mt-16">
                    <div class="text-5xl font-medium underline cursor-pointer w-fit">
                        <NuxtLink to="/projects">-> See all projects</NuxtLink>
                    </div>
                </div>

                <!-- About me Section -->
                <div class="flex">
                    <div class="w-1/5">
                        <!-- SVG -->
                    </div>

                    <!-- Main Section -->
                    <div class="w-4/5 flex flex-col items-start">
                        <div class="secondary-color text-[200px] font-bold">
                            About me
                        </div>
                        <div class="text-6xl mb-16">
                            I'm a creative full-stack developer and I train myself in the latest
                            technologies to create web applications that blend aesthetics,
                            interactivity and practicality.
                        </div>

                        <!-- Core tool section -->
                        <div class="grid grid-cols-3 gap-4 w-full">
                            <div>
                                <div class="text-4xl font-semibold mb-4">Nuxt.js</div>
                                <div>
                                    Nuxt.js is positioned as a sophisticated development framework for the creation
                                    of modern web applications, building on the power of Vue.js. It simplifies the
                                    implementation of advanced features such as static site generation, automated
                                    routing and performance optimization, enabling developers to create robust,
                                    scalable web experiences.
                                </div>
                            </div>
                            <div>
                                <div class="text-4xl font-semibold mb-4">Node.js</div>
                                <div>
                                    Node.js is a server-side JavaScript runtime environment designed for
                                    scalable network applications. It enables the creation of fast, high-performance
                                    web applications thanks to its non-blocking architecture and vast ecosystem of
                                    modules.
                                </div>
                            </div>
                            <div>
                                <div class="text-4xl font-semibold mb-4">GSAP</div>
                                <div>
                                    GSAP (GreenSock Animation Platform) has established itself as JavaScript
                                    library for the creation of high-performance web animations.
                                    It offers precise control over the animation of HTML elements, enabling
                                    smooth transitions and complex visual effects.
                                </div>
                            </div>
                            <div>
                                <div class="text-4xl font-semibold mb-4">Figma</div>
                                <div>
                                    Figma has established itself as the benchmark platform for digital
                                    interface design and real-time collaboration. It offers powerful
                                    design and prototyping tools, enabling teams to create and share
                                    interactive mock-ups in an intuitive web interface.
                                </div>
                            </div>
                            <div>
                                <div class="text-4xl font-semibold mb-4">TailwindCSS</div>
                                <div>
                                    TailwindCSS emerges as a utility-first CSS framework that revolutionizes web styling
                                    through its atomic approach. It provides a comprehensive set of pre-built classes
                                    for rapid interface development, enabling developers to design responsive layouts
                                    without leaving their HTML.
                                </div>
                            </div>
                            <div>
                                <div class="text-4xl font-semibold mb-4">PostgreSQL</div>
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
            </div>
        </div>
    </div>
</template>

<script>
import Header from '~/components/header.vue'
import SelectedProject from '~/components/SelectedProject.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default {
    components: {
        Header,
        SelectedProject
    },
    data() {
        return {
            // Class-based positioning for scroll indicator that adapts to screen size
            scrollClass: 'scroll-responsive',
            // Animation settings for different device sizes
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
            scrollTriggerInstance: null,
            // Données des projets sélectionnés
            selectedProjects: [
                {
                    id: 'projet-1',
                    datePrincipal: '01/02',
                    annee: '2024-2025',
                    services: 'Interactive Design <br /> Full Development',
                    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos quisquam omnis architecto neque minus soluta! Fuga laudantium perferendis, explicabo modi similique reprehenderit! Quae et reprehenderit quaerat facilis voluptate, dolorum pariatur!',
                    titre: 'Mouvements & Harmonie',
                    imageUrl: '/assets/img/projects/MouvementEtHarmonie.jpg'
                },
                {
                    id: 'projet-2',
                    datePrincipal: '02/02',
                    annee: '2025',
                    services: 'Interactive Design <br /> Full Development',
                    description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos quisquam omnis architecto neque minus soluta! Fuga laudantium perferendis, explicabo modi similique reprehenderit! Quae et reprehenderit quaerat facilis voluptate, dolorum pariatur!',
                    titre: 'So\'Deco',
                    imageUrl: '/assets/img/projects/project2.jpg'
                }
            ]
        }
    },
    mounted() {
        gsap.registerPlugin(ScrollTrigger)

        this.setupResponsive()
        window.addEventListener('resize', this.setupResponsive)

        this.initAnimation()
    },
    methods: {
        // Méthode pour naviguer vers la page détaillée d'un projet
        navigateToProject(projectId) {
            this.$router.push(`/projets/${projectId}`)
            console.log(`Navigation vers le projet: ${projectId}`)
        },

        setupResponsive() {
            const width = window.innerWidth

            // Update scroll indicator position
            if (width < 640) { // Mobile
                this.scrollClass = 'scroll-mobile'
                this.currentAnimSettings = this.animationSettings.mobile
            } else if (width < 1024) { // Tablet
                this.scrollClass = 'scroll-tablet'
                this.currentAnimSettings = this.animationSettings.tablet
            } else { // Desktop
                this.scrollClass = 'scroll-desktop'
                this.currentAnimSettings = this.animationSettings.desktop
            }

            // Refresh the animation with new settings
            this.refreshAnimation()
        },

        initAnimation() {
            const path = this.$refs.path
            const pathLength = path.getTotalLength()

            // Configurer le chemin SVG pour l'animation
            gsap.set(path, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                opacity: 1,
                onComplete: function () {
                    path.classList.remove('invisible-path');
                }
            })

            // Créer l'animation qui dessine le chemin
            this.createScrollTrigger(path, pathLength)
        },

        createScrollTrigger(path, pathLength) {
            // Kill previous instance if it exists
            if (this.scrollTriggerInstance) {
                this.scrollTriggerInstance.kill()
            }

            // Create new animation with current settings
            const tween = gsap.to(path, {
                strokeDashoffset: 0,
                duration: 2,
                ease: "power2.out"
            })

            // Create ScrollTrigger and store the instance
            this.scrollTriggerInstance = ScrollTrigger.create({
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
                        })
                    }
                }
            })
        },

        refreshAnimation() {
            // Get path element
            const path = this.$refs.path

            // Only proceed if path exists and ScrollTrigger is initialized
            if (path && this.scrollTriggerInstance) {
                // Update the ScrollTrigger with new settings
                this.scrollTriggerInstance.vars.start = this.currentAnimSettings.start
                this.scrollTriggerInstance.vars.end = this.currentAnimSettings.end

                // Refresh the ScrollTrigger to apply changes
                this.scrollTriggerInstance.refresh()
            }
        }
    },
    beforeDestroy() {
        // Clean up event listener
        window.removeEventListener('resize', this.setupResponsive)

        // Kill ScrollTrigger instance
        if (this.scrollTriggerInstance) {
            this.scrollTriggerInstance.kill()
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

/* Responsive position classes for the scroll indicator */
.scroll-mobile {
    top: 40% !important;
    right: 10% !important;
    transform: translateY(-50%) !important;
}

.scroll-tablet {
    top: 45% !important;
    right: 15% !important;
    transform: translateY(-50%) !important;
}

.scroll-desktop {
    top: 55% !important;
    right: 16% !important;
    transform: translateY(-50%) !important;
}

.bg-secondary {
    background-color: #2F4A4F;
}
</style>