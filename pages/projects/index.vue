<template>
    <Header />
    <div class="relative min-h-screen overflow-hidden">
        <!-- Title section -->
        <!-- Titre au niveau "section" (et non display) : le slider plein écran doit rester visible sans défiler -->
        <div class="site-container pt-8 sm:pt-12 pb-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h1 class="secondary-color text-section">{{ $t('projectsPage.title') }}</h1>
            <p class="text-subtitle primary-color">{{ $t('projectsPage.years') }}</p>
        </div>

        <!-- Portfolio Slider Section -->
        <div class="portfolio-slider relative site-container h-[calc(100svh-290px)] min-h-[460px]" @wheel="handleWheelEvent">
            <!-- Project Cards Stack -->
            <div class="portfolio-slider-center h-full flex items-center justify-center relative">
                <div v-for="(project, index) in allProjects" :key="project.id" :class="[
                    'project-card',
                    'absolute top-0 left-0 w-full h-full flex items-center justify-center',
                    { 'active-project': currentProjectIndex === index }
                ]" :style="getCardStyle(index)">
                    <!-- Mobile : capture pleine largeur puis infos dessous ; dès md : services | capture | infos -->
                    <div class="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
                        <!-- Services à gauche avec animation -->
                        <div class="service-section hidden md:block md:w-1/4" :class="{ 'invisible': index !== currentProjectIndex }">
                            <div :id="`service-${index}`"
                                class="service-animation transform opacity-0 text-subtitle primary-color">
                                <span v-for="(service, serviceIndex) in projectServices(project.id)" :key="serviceIndex"
                                    class="block">{{ service }}</span>
                            </div>
                        </div>

                        <!-- Capture au milieu avec effet tilt -->
                        <div class="card-section w-full md:w-2/4 md:px-8 flex items-center justify-center">
                            <div class="project-image-container w-full" :ref="`tiltRef${index}`">
                                <div :style="{ backgroundColor: getProjectColor(index) }"
                                    class="w-full h-[240px] sm:h-[320px] md:h-[400px] rounded-lg shadow-lg transform-style-3d overflow-hidden">
                                    <!-- Capture du projet (lien vers l'étude de cas si elle existe) -->
                                    <component :is="hasCaseStudy(project.id) ? NuxtLink : 'div'" v-if="project.imageUrl"
                                        :to="hasCaseStudy(project.id) ? localePath(`/projects/${project.id}`) : undefined"
                                        :tabindex="index === currentProjectIndex ? undefined : -1"
                                        class="block w-full h-full">
                                        <img :src="project.imageUrl" :srcset="project.imageSrcset || undefined"
                                            :sizes="project.imageSrcset ? '(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw' : undefined"
                                            :width="project.imageWidth" :height="project.imageHeight"
                                            :loading="index === 0 ? 'eager' : 'lazy'" decoding="async"
                                            class="w-full h-full object-cover object-left-top"
                                            :alt="$t(`projects.${project.id}.title`)" />
                                    </component>
                                </div>
                            </div>
                        </div>

                        <!-- Titre et année à droite seulement -->
                        <div class="info-section w-full md:w-1/4" :class="{ 'invisible': index !== currentProjectIndex }">
                            <div :id="`info-${index}`" class="project-info transform opacity-0">
                                <ProjectCategoryBadge :category="project.category" class="mb-3" />
                                <h2 class="text-subtitle secondary-color mb-3">
                                    {{ $t(`projects.${project.id}.title`) }}
                                </h2>
                                <div class="text-xl font-medium mb-2 secondary-color">{{ project.annee }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Portfolio Counter -->
            <div
                class="portfolio-counter absolute bottom-8 left-8 sm:left-24 text-xl sm:text-2xl font-semibold secondary-color z-50">
                {{ formatProjectNumber(currentProjectIndex + 1) }} / {{ formatProjectNumber(allProjects.length) }}
            </div>

            <!-- Portfolio Cursor (VOIR / FOOTER ↓) -->
            <button type="button"
                class="portfolio-cursor absolute bottom-8 right-8 sm:right-24 text-xl sm:text-2xl font-semibold secondary-color underline underline-offset-4 decoration-2 opacity-0 z-50"
                ref="showCursor" @click="handleCursorClick">
                {{ isLastProjectReached ? $t('projectsPage.toFooter') : $t('projectsPage.next') }}
            </button>
        </div>

        <!-- Footer visible (marges gérées par le composant, identiques sur toutes les pages) -->
        <div class="mt-4" id="footer-section">
            <Footer />
        </div>
    </div>
</template>

<script>
import { useHead } from '#app'
import { onMounted, onBeforeUnmount, ref, computed, nextTick } from 'vue'
import Header from '~/components/header.vue'
import Footer from '~/components/footer.vue'
import { useProjectStore } from '~/stores/projectStore'
import { NuxtLink } from '#components'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '~/composables/useRevealAnimations'

export default {
    components: {
        Header,
        Footer
    },
    setup() {
        // Textes des projets (titre, services) : fichiers de locale, cf. useMessageList
        const list = useMessageList()
        const localePath = useLocalePath()
        const projectStore = useProjectStore()
        const hasCaseStudy = (id) => projectStore.hasCaseStudy(id)
        const projectServices = (id) => list(`projects.${id}.services`)

        const { t } = useI18n()
        useSeoMeta({
            title: () => t('meta.projects.title'),
            description: () => t('meta.projects.description'),
            ogTitle: () => t('meta.projects.title'),
            ogDescription: () => t('meta.projects.description')
        })

        // Ajouter vanilla-tilt et GSAP
        useHead({
            script: [
                { src: 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.2/vanilla-tilt.min.js', body: true }
            ]
        })

        const tiltInstances = ref([])
        const scrollTriggerInstances = ref([])
        const showCursor = ref(null)
        const currentProjectIndex = ref(0)
        const isAnimating = ref(false)
        const scrollDirection = ref('down') // 'up' ou 'down'
        let wheelTimeout = null
        let lastScrollTime = 0
        const scrollCooldown = 1200 // Temps minimum entre chaque défilement en ms
        const isLastProjectReached = ref(false) // Nouvelle variable pour suivre si on a atteint le dernier projet

        // Formatage du numéro de projet avec deux chiffres
        const formatProjectNumber = (num) => {
            return num.toString().padStart(2, '0')
        }

        // Couleur de fond de la carte (visible tant que la capture n'est pas chargée, ou sans capture)
        const getProjectColor = (index) => {
            const colors = [
                '#2F4A4F', // site-secondary
                '#899EA2', // site-link
                '#CBD5E1'  // slate-300
            ];
            return colors[index % colors.length];
        }

        // Style pour les cartes en fonction de leur position dans la pile
        const getCardStyle = (index) => {
            const currentIdx = currentProjectIndex.value

            if (index < currentIdx) {
                // Projets déjà vus - cachés en haut de l'écran
                return {
                    opacity: 0,
                    visibility: 'hidden',
                    zIndex: -10,
                    transform: `translate(0, -150vh) scale(0.7)`
                }
            } else if (index === currentIdx) {
                // Projet actuel
                return {
                    opacity: 1,
                    visibility: 'visible',
                    zIndex: 10,
                    transform: `translate(0, 0) scale(1)`
                }
            } else if (index === currentIdx + 1) {
                // Projet suivant
                return {
                    opacity: 0.85,
                    visibility: 'visible',
                    zIndex: 5,
                    transform: `translate(0, 40px) scale(0.95)`
                }
            } else if (index === currentIdx + 2) {
                // Projet après le suivant (dernier visible)
                return {
                    opacity: 0.7,
                    visibility: 'visible',
                    zIndex: 4,
                    transform: `translate(0, 80px) scale(0.9)`
                }
            } else {
                // Tous les autres projets - complètement cachés
                return {
                    opacity: 0,
                    visibility: 'hidden',
                    zIndex: -1,
                    transform: `translate(0, 150vh) scale(0.7)`
                }
            }
        }

        // Animation des éléments du projet actif selon la direction
        const animateActiveProject = () => {
            const activeProject = document.querySelector('.active-project')

            if (activeProject) {
                const serviceElement = activeProject.querySelector('.service-animation')
                const infoElement = activeProject.querySelector('.project-info')

                if (scrollDirection.value === 'down') {
                    // Animation vers le bas (entrée depuis le haut)
                    if (serviceElement) {
                        gsap.fromTo(
                            serviceElement,
                            { y: -50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                        )
                    }

                    if (infoElement) {
                        gsap.fromTo(
                            infoElement,
                            { y: -50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 }
                        )
                    }
                } else {
                    // Animation vers le haut (entrée depuis le bas)
                    if (serviceElement) {
                        gsap.fromTo(
                            serviceElement,
                            { y: 50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                        )
                    }

                    if (infoElement) {
                        gsap.fromTo(
                            infoElement,
                            { y: 50, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 }
                        )
                    }
                }
            }
        }

        // Animation de sortie pour le projet qui disparaît
        const animateProjectExit = (index) => {
            const projects = document.querySelectorAll('.project-card')
            const oldProject = projects[index]

            if (oldProject) {
                const serviceElement = oldProject.querySelector('.service-animation')
                const infoElement = oldProject.querySelector('.project-info')

                if (scrollDirection.value === 'down') {
                    // Sortie vers le haut (quand on descend)
                    if (serviceElement) {
                        gsap.to(serviceElement, { y: -80, opacity: 0, duration: 0.4, ease: "power2.in" })
                    }

                    if (infoElement) {
                        gsap.to(infoElement, { y: -80, opacity: 0, duration: 0.4, ease: "power2.in" })
                    }
                } else {
                    // Sortie vers le bas (quand on remonte)
                    if (serviceElement) {
                        gsap.to(serviceElement, { y: 80, opacity: 0, duration: 0.4, ease: "power2.in" })
                    }

                    if (infoElement) {
                        gsap.to(infoElement, { y: 80, opacity: 0, duration: 0.4, ease: "power2.in" })
                    }
                }
            }
        }

        // Animation du premier projet au chargement de la page
        const animateFirstProject = () => {
            // Attendre que le DOM soit complètement mis à jour
            nextTick(() => {
                const activeProject = document.querySelector('.active-project')
                if (!activeProject) return

                const serviceElement = activeProject.querySelector('.service-animation')
                const infoElement = activeProject.querySelector('.project-info')

                // Afficher immédiatement les conteneurs pour s'assurer qu'ils sont visibles
                if (activeProject.querySelector('.service-section')) {
                    activeProject.querySelector('.service-section').classList.remove('invisible')
                }

                if (activeProject.querySelector('.info-section')) {
                    activeProject.querySelector('.info-section').classList.remove('invisible')
                }

                // Animer les éléments depuis le haut (comme si la carte descendait)
                if (serviceElement) {
                    gsap.fromTo(
                        serviceElement,
                        { y: -80, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
                    )
                }

                if (infoElement) {
                    gsap.fromTo(
                        infoElement,
                        { y: -80, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.4 }
                    )
                }

                // Afficher le curseur VOIR
                if (showCursor.value && allProjects.value.length > 1) {
                    gsap.to(showCursor.value, { opacity: 1, duration: 0.5, delay: 0.6 })
                }
            })
        }

        // Gestion de la navigation entre projets avec cooldown
        const goToNextProject = () => {
            const now = Date.now()
            if (isAnimating.value || currentProjectIndex.value >= allProjects.value.length - 1 || now - lastScrollTime < scrollCooldown) return

            lastScrollTime = now
            scrollDirection.value = 'down'
            isAnimating.value = true

            // Optimisation: changer immédiatement l'index et appliquer la transition CSS
            const oldIndex = currentProjectIndex.value

            // Animation de sortie du projet actuel
            animateProjectExit(oldIndex)

            // Animation du curseur VOIR
            gsap.to(showCursor.value, { opacity: 0, duration: 0.3, ease: "power1.in" })

            // Transition entre projets
            setTimeout(() => {
                currentProjectIndex.value++

                // Si on atteint le dernier projet
                if (currentProjectIndex.value === allProjects.value.length - 1) {
                    isLastProjectReached.value = true
                    // Activer le défilement normal vers le footer
                    enableNormalScrolling();
                }

                // Animer le nouveau projet
                requestAnimationFrame(() => {
                    animateActiveProject()

                    // Réinitialiser l'état après l'animation
                    setTimeout(() => {
                        isAnimating.value = false

                        // Montrer à nouveau le curseur si ce n'est pas le dernier projet
                        if (currentProjectIndex.value < allProjects.value.length - 1) {
                            gsap.to(showCursor.value, { opacity: 1, duration: 0.3, ease: "power1.out" })
                        }
                    }, 400)
                })
            }, 300)
        }

        const goToPrevProject = () => {
            const now = Date.now()
            if (isAnimating.value || currentProjectIndex.value <= 0 || now - lastScrollTime < scrollCooldown) return

            lastScrollTime = now
            scrollDirection.value = 'up'
            isAnimating.value = true

            // Optimisation: changer immédiatement l'index et appliquer la transition CSS
            const oldIndex = currentProjectIndex.value

            // Animation de sortie du projet actuel
            animateProjectExit(oldIndex)

            // Animation du curseur VOIR
            gsap.to(showCursor.value, { opacity: 0, duration: 0.3, ease: "power1.in" })

            // Transition entre projets
            setTimeout(() => {
                currentProjectIndex.value--

                // Si on n'est plus au dernier projet, désactiver le défilement normal
                if (isLastProjectReached.value && currentProjectIndex.value < allProjects.value.length - 1) {
                    isLastProjectReached.value = false
                    disableNormalScrolling();
                }

                // Animer le nouveau projet
                requestAnimationFrame(() => {
                    animateActiveProject()

                    // Réinitialiser l'état après l'animation
                    setTimeout(() => {
                        isAnimating.value = false

                        // Toujours montrer le curseur quand on remonte
                        gsap.to(showCursor.value, { opacity: 1, duration: 0.3, ease: "power1.out" })
                    }, 300)
                })
            }, 300)
        }

        // Gérer l'événement de scroll
        const handleWheelEvent = (e) => {
            // Dernier projet atteint : scroll natif vers le footer, et dans les deux sens tant que la page
            // est défilée (sinon remonter relancerait le slider en laissant la page bloquée en bas).
            // NB : pas de modificateur .prevent sur @wheel, sinon preventDefault() précède ce return.
            if (isLastProjectReached.value && (e.deltaY > 0 || window.scrollY > 0)) {
                return;
            }

            e.preventDefault(); // Empêcher le scroll par défaut pour les autres cas

            // Toujours traiter un seul événement de scroll à la fois, quelle que soit l'amplitude
            const now = Date.now()
            if (now - lastScrollTime < scrollCooldown || isAnimating.value) return

            if (e.deltaY > 0) {
                // Un seul projet à la fois, quelle que soit l'amplitude
                goToNextProject()
            } else if (e.deltaY < 0) {
                // Un seul projet à la fois, quelle que soit l'amplitude
                goToPrevProject()
            }
        }

        // Nouvelle fonction pour activer le défilement normal
        const enableNormalScrolling = () => {
            if (process.client) {
                // Supprimer l'écouteur d'événement qui bloque le défilement
                window.removeEventListener('wheel', preventDefaultScroll);

                // Animer la flèche ou un autre indicateur pour montrer qu'on peut défiler vers le footer
                gsap.to(showCursor.value, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power1.out"
                });
            }
        }

        // Nouvelle fonction pour désactiver le défilement normal
        const disableNormalScrolling = () => {
            if (process.client) {
                // Remettre l'écouteur d'événement qui bloque le défilement
                window.addEventListener('wheel', preventDefaultScroll, { passive: false });
            }
        }

        // Gérer les touches clavier pour la navigation
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                // Si on est au dernier projet, permettre le scroll normal
                if (isLastProjectReached.value) {
                    return;
                }
                e.preventDefault();
                goToNextProject()
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                // Page défilée jusqu'au footer : laisser remonter nativement
                if (isLastProjectReached.value && window.scrollY > 0) {
                    return;
                }
                e.preventDefault();
                goToPrevProject()
            }
        }

        // Cleanup function for tilt instances
        const cleanupTilt = () => {
            if (tiltInstances.value && tiltInstances.value.length) {
                tiltInstances.value.forEach(instance => {
                    if (instance && instance.destroy) {
                        instance.destroy()
                    }
                })
                tiltInstances.value = []
            }
        }

        // Cleanup function for ScrollTrigger instances
        const cleanupScrollTrigger = () => {
            if (scrollTriggerInstances.value && scrollTriggerInstances.value.length) {
                scrollTriggerInstances.value.forEach(instance => {
                    if (instance && instance.kill) {
                        instance.kill()
                    }
                })
                scrollTriggerInstances.value = []
            }
        }

        // Initialize tilt effect
        const initializeTilt = (refs) => {
            if (process.client && window.VanillaTilt) {
                // Clean previous instances
                cleanupTilt()

                // Loop through refs and apply tilt
                refs.forEach(ref => {
                    if (ref && ref.children[0]) {
                        const instance = window.VanillaTilt.init(ref.children[0], {
                            max: 15,
                            speed: 400,
                            glare: true,
                            "max-glare": 0.4,
                            scale: 1.05,
                            perspective: 1000,
                            transition: true,
                            gyroscope: true,
                            gyroscopeMinAngleX: -45,
                            gyroscopeMaxAngleX: 45,
                            gyroscopeMinAngleY: -45,
                            gyroscopeMaxAngleY: 45
                        })
                        tiltInstances.value.push(instance)
                    }
                })
            } else {
                // Si VanillaTilt n'est pas encore chargé, réessayer après un court délai
                setTimeout(() => {
                    initializeTilt(refs)
                }, 500)
            }
        }

        // Bloquer le scroll de la page
        const preventDefaultScroll = (e) => {
            e.preventDefault();
        }

        // Clic sur le libellé VOIR / FOOTER : projet suivant, ou défilement vers le footer au dernier projet
        const handleCursorClick = () => {
            if (isLastProjectReached.value) {
                document.getElementById('footer-section')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
            } else {
                goToNextProject()
            }
        }

        onMounted(() => {
            if (process.client) {
                // Enregistrer le plugin ScrollTrigger
                gsap.registerPlugin(ScrollTrigger)

                // Bloquer le scroll par défaut sur la page
                window.addEventListener('wheel', preventDefaultScroll, { passive: false });

                // Mettre en place les écouteurs d'événements pour les touches
                window.addEventListener('keydown', handleKeyDown);

                // Pour le tactile (swipe)
                let touchStartY = 0

                const handleTouchStart = (e) => {
                    touchStartY = e.touches[0].clientY
                }

                const handleTouchEnd = (e) => {
                    const touchEndY = e.changedTouches[0].clientY
                    const diff = touchStartY - touchEndY

                    // Si on est au dernier projet et qu'on swipe vers le bas, permettre le défilement normal
                    if (isLastProjectReached.value && (diff > 50 || window.scrollY > 0)) {
                        return;
                    }

                    // Un seul projet à la fois, quel que soit l'ampleur du swipe
                    if (Math.abs(diff) > 50) { // Seuil minimum pour considérer un swipe
                        if (diff > 0) {
                            goToNextProject() // Swipe vers le haut
                        } else {
                            goToPrevProject() // Swipe vers le bas
                        }
                    }
                }

                window.addEventListener('touchstart', handleTouchStart);
                window.addEventListener('touchend', handleTouchEnd);

                // Initialiser les animations après un court délai pour s'assurer que le DOM est prêt
                setTimeout(() => {
                    const projectStore = useProjectStore()
                    const projects = projectStore.getAllProjects

                    // S'assurer que le premier projet est bien défini comme actif
                    currentProjectIndex.value = 0

                    // Conteneurs d'image pour l'effet tilt (pas de `this` dans setup() : requête DOM directe)
                    const tiltRefs = Array.from(document.querySelectorAll('.project-image-container'))

                    // Initialiser l'effet tilt
                    initializeTilt(tiltRefs)

                    // Animer le premier projet après avoir donné du temps au DOM de se stabiliser
                    setTimeout(() => {
                        animateFirstProject()
                    }, 200)

                }, 300)

                onBeforeUnmount(() => {
                    // Nettoyer les écouteurs d'événements
                    window.removeEventListener('wheel', preventDefaultScroll);
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('touchstart', handleTouchStart);
                    window.removeEventListener('touchend', handleTouchEnd);

                    cleanupTilt()
                    cleanupScrollTrigger()

                    if (wheelTimeout) {
                        clearTimeout(wheelTimeout)
                    }
                })
            }
        })

        // Computed pour les projets
        const allProjects = computed(() => projectStore.getAllProjects)

        return {
            projectServices,
            localePath,
            hasCaseStudy,
            NuxtLink,
            currentProjectIndex,
            allProjects,
            cleanupTilt,
            initializeTilt,
            cleanupScrollTrigger,
            getCardStyle,
            getProjectColor,
            formatProjectNumber,
            showCursor,
            handleWheelEvent,
            handleCursorClick,
            scrollDirection,
            isLastProjectReached,
            enableNormalScrolling,
            disableNormalScrolling
        }
    }
}
</script>

<style scoped>
.portfolio-slider {
    position: relative;
    overflow: hidden;
}

.project-card {
    will-change: transform, opacity;
    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1),
        opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

/* Mobile : la capture est en pleine largeur avec les infos dessous, l'aperçu des cartes suivantes
   (décalées de 40/80 px) chevaucherait ces infos : seule la carte active reste visible */
@media (max-width: 767px) {
    .project-card:not(.active-project) {
        opacity: 0 !important;
    }
}

.project-image-container {
    overflow: hidden;
    border-radius: 0.5rem;
    perspective: 1000px;
}

.transform-style-3d {
    transform-style: preserve-3d;
}

/* Animation initiale cachée */
.service-animation,
.project-info {
    will-change: transform, opacity;
}

/* Effet de glare pour vanilla-tilt */
.js-tilt-glare {
    border-radius: 8px;
}

/* Animation du curseur VOIR */
.portfolio-cursor {
    cursor: pointer;
    transition: opacity 0.3s ease;
}

/* Utilisation de classes au lieu de hidden pour garder la structure mais masquer visuellement */
.invisible {
    visibility: hidden;
    opacity: 0;
}
</style>