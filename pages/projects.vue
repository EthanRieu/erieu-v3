<template>
    <Header />
    <div class="relative min-h-screen text-white">
        <!-- Title section -->
        <div class="px-8 sm:px-16 py-8">
            <h1 class="text-3xl sm:text-4xl font-bold text-teal-500 mb-4">Projects - 2024 / 2025</h1>
        </div>

        <!-- Project Carousel -->
        <div class="relative w-full overflow-hidden" ref="carouselContainer">
            <div ref="carousel" class="flex" :style="{ transform: `translateX(${position}px)` }" @mousedown="startDrag"
                @mousemove="onDrag" @mouseup="endDrag" @mouseleave="endDrag" @touchstart="startDrag" @touchmove="onDrag"
                @touchend="endDrag">
                <div v-for="(project, index) in displayProjects" :key="`${project.id}-${index}`"
                    class="project-card w-[95%] sm:w-[45%] md:w-[30%] px-4 py-4">
                    <div class="bg-[#22303d] rounded-xl overflow-hidden shadow-lg h-full">
                        <div class="w-full h-48 sm:h-56 md:h-64">
                            <img :src="project.imageUrl || '/assets/img/placeholder.jpg'" :alt="project.titre"
                                class="w-full h-full object-cover" />
                        </div>
                        <div class="p-4">
                            <h2 class="text-xl font-bold mb-2 text-teal-500 truncate">{{ project.titre }}</h2>
                            <div class="flex flex-col mb-2">
                                <div class="text-sm font-medium">{{ project.annee }}</div>
                                <div class="text-sm font-medium" v-html="project.services"></div>
                            </div>
                            <p class="text-gray-300 text-sm line-clamp-2">{{ project.description }}</p>
                            <button @click="navigateToProject(project.id)"
                                class="mt-2 px-3 py-1 text-sm bg-teal-700 text-white rounded-lg hover:bg-teal-600 transition-colors">
                                Voir le projet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Footer />
</template>

<script>
import { gsap } from 'gsap'
import Header from '~/components/header.vue'
import Footer from '~/components/footer.vue'
import { useProjectStore } from '~/stores/projectStore'

export default {
    components: {
        Header,
        Footer
    },
    data() {
        return {
            position: 0,
            isDragging: false,
            startX: 0,
            currentX: 0,
            lastX: 0,
            startPosition: 0,
            totalWidth: 0,
            cardWidth: 0,
            containerWidth: 0,
            velocityX: 0,
            lastTimestamp: 0,
            timestamps: [],
            positions: [],
            maxVelocitySamples: 5
        }
    },
    computed: {
        allProjects() {
            const projectStore = useProjectStore()
            return projectStore.getAllProjects
        },
        displayProjects() {
            if (!this.allProjects.length) return []

            // Dupliquer les projets pour l'effet infini
            return [
                ...this.allProjects,  // Tous les projets originaux
                ...this.allProjects.slice(0, 4)  // Répéter plusieurs projets pour assurer l'effet de boucle
            ]
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.calculateDimensions()
            this.setInitialPosition()
            window.addEventListener('resize', this.handleResize)
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        calculateDimensions() {
            if (!this.$refs.carouselContainer || !this.$refs.carousel) return

            this.containerWidth = this.$refs.carouselContainer.offsetWidth

            // Obtenir la largeur du premier élément de carte
            if (this.$refs.carousel.firstElementChild) {
                this.cardWidth = this.$refs.carousel.firstElementChild.offsetWidth
            } else {
                // Fallback aux valeurs estimées
                this.cardWidth = window.innerWidth < 768 ? this.containerWidth * 0.95 : this.containerWidth * 0.3
            }

            // Calculer la largeur totale des projets originaux
            this.totalWidth = this.cardWidth * this.allProjects.length
        },

        setInitialPosition() {
            this.position = 0
        },

        handleResize() {
            const oldTotalWidth = this.totalWidth

            this.calculateDimensions()

            // Ajuster la position proportionnellement
            if (oldTotalWidth > 0) {
                this.position = (this.position / oldTotalWidth) * this.totalWidth
            }

            this.checkBounds(false)
        },

        checkBounds(animate = true) {
            // Vérifier si nous avons atteint les limites pour l'effet infini

            // Si nous sommes allés trop loin vers la droite (début)
            if (this.position > 0) {
                const newPosition = this.position - this.totalWidth

                if (animate) {
                    // Transition instantanée
                    if (this.$refs.carousel) {
                        this.$refs.carousel.style.transition = 'none'
                        this.position = newPosition
                        // Forcer un reflow
                        // eslint-disable-next-line no-unused-expressions
                        this.$refs.carousel.offsetHeight
                    }
                } else {
                    this.position = newPosition
                }
            }

            // Si nous sommes allés trop loin vers la gauche (fin)
            const minPosition = -(this.totalWidth)
            if (this.position < minPosition) {
                const newPosition = this.position + this.totalWidth

                if (animate) {
                    // Transition instantanée
                    if (this.$refs.carousel) {
                        this.$refs.carousel.style.transition = 'none'
                        this.position = newPosition
                        // Forcer un reflow
                        // eslint-disable-next-line no-unused-expressions
                        this.$refs.carousel.offsetHeight
                    }
                } else {
                    this.position = newPosition
                }
            }
        },

        // Gestion du glissement avec inertie
        startDrag(e) {
            if (this.isDragging) return

            // Arrêter toute animation en cours
            gsap.killTweensOf(this)

            this.isDragging = true
            this.startX = this.getPositionX(e)
            this.lastX = this.startX
            this.currentX = this.startX
            this.startPosition = this.position

            // Réinitialiser les données de vélocité
            this.velocityX = 0
            this.timestamps = []
            this.positions = []
            this.lastTimestamp = Date.now()

            // Désactiver les transitions pour un mouvement fluide
            if (this.$refs.carousel) {
                this.$refs.carousel.style.transition = 'none'
            }
        },

        onDrag(e) {
            if (!this.isDragging) return

            // Empêcher le défilement de la page
            e.preventDefault()

            const currentPosition = this.getPositionX(e)
            const diff = currentPosition - this.startX

            // Mettre à jour la position
            this.position = this.startPosition + diff

            // Enregistrer la position et l'horodatage pour calculer la vélocité
            const timestamp = Date.now()
            const elapsed = timestamp - this.lastTimestamp

            if (elapsed > 20) { // Limiter la fréquence d'échantillonnage
                this.timestamps.push(timestamp)
                this.positions.push(currentPosition)

                // Garder seulement les N derniers échantillons
                if (this.timestamps.length > this.maxVelocitySamples) {
                    this.timestamps.shift()
                    this.positions.shift()
                }

                this.lastTimestamp = timestamp
                this.lastX = this.currentX
            }

            this.currentX = currentPosition

            // Vérifier les limites pendant le glissement
            this.checkBounds(false)
        },

        endDrag() {
            if (!this.isDragging) return

            this.isDragging = false

            // Calculer la vélocité (pixels par milliseconde)
            let velocity = 0

            if (this.timestamps.length > 1) {
                const recentTime = this.timestamps[this.timestamps.length - 1]
                const oldestTime = this.timestamps[0]
                const timeElapsed = recentTime - oldestTime

                const recentPosition = this.positions[this.positions.length - 1]
                const oldestPosition = this.positions[0]
                const positionDelta = recentPosition - oldestPosition

                if (timeElapsed > 0) {
                    velocity = positionDelta / timeElapsed
                }
            }

            // Amplifier la vélocité pour un meilleur effet
            velocity = velocity * 120

            // Limiter la vélocité maximum
            const maxVelocity = 15
            velocity = Math.max(Math.min(velocity, maxVelocity), -maxVelocity)

            // Si la vélocité est suffisante, appliquer l'effet d'inertie
            if (Math.abs(velocity) > 0.1) {
                // Calculer la distance que le carrousel va encore parcourir
                const momentum = velocity * 15
                const targetPosition = this.position + momentum

                // Animer avec un effet d'amortissement
                gsap.to(this, {
                    position: targetPosition,
                    duration: 0.8,
                    ease: "power2.out",
                    onUpdate: () => this.checkBounds(true),
                    onComplete: () => {
                        if (this.$refs.carousel) {
                            this.$refs.carousel.style.transition = 'none'
                        }
                    }
                })
            } else {
                // Pas assez de vélocité, juste vérifier les limites
                this.checkBounds(true)

                setTimeout(() => {
                    if (this.$refs.carousel) {
                        this.$refs.carousel.style.transition = 'none'
                    }
                }, 50)
            }
        },

        getPositionX(e) {
            return e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
        },

        navigateToProject(projectId) {
            const projectStore = useProjectStore()
            projectStore.selectProject(projectId)
            this.$router.push(`/projets/${projectId}`)
        }
    }
}
</script>

<style scoped>
.project-card {
    user-select: none;
    -webkit-user-drag: none;
    cursor: grab;
    flex-shrink: 0;
}

.project-card:active {
    cursor: grabbing;
}

button {
    -webkit-tap-highlight-color: transparent;
}
</style>