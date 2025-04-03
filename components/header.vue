<template>
    <header class="p-4 md:p-6 lg:p-8">
        <div class="flex items-center justify-between">
            <!-- Logo et Location/Hour -->
            <div class="flex items-center space-x-4 md:space-x-8 lg:space-x-16">
                <!-- Logo -->
                <div class="w-28 md:w-32 lg:w-40">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 1500 500" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">

                        <!-- ERIEU Text -->
                        <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75"
                            font-weight="800" transform="matrix(5 0 0 5 109.262384 384.859102)" class="header-theme-text"
                            stroke-width="0">
                            <tspan y="0" font-weight="800" stroke-width="0">ERIEU</tspan>
                        </text>

                        <!-- TM Text -->
                        <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75"
                            font-weight="800" transform="translate(1266.074934 142.194716)" class="header-theme-text"
                            stroke-width="0">
                            <tspan y="0" font-weight="800" stroke-width="0">TM</tspan>
                        </text>
                    </svg>
                </div>

                <!-- Location and Hour - caché sur mobile -->
                <div class="hidden md:block">
                    <LiveClock timezone="Europe/Paris" />
                </div>
            </div>

            <!-- Navigation desktop -->
            <div class="hidden md:flex items-center space-x-8 lg:space-x-16">
                <!-- Menu de navigation visible sur desktop -->
                <nav>
                    <ul class="flex flex-row space-x-2 text-lg lg:text-xl font-medium">
                        <NuxtLink to="/" class="router-link primary-color"
                            :class="{ 'font-bold': $route.path === '/' }">
                            Home
                        </NuxtLink>
                        <NuxtLink to="/projects" class="router-link primary-color"
                            :class="{ 'font-bold': $route.path === '/projects' }">
                            Projects
                        </NuxtLink>
                        <NuxtLink to="/about" class="router-link primary-color"
                            :class="{ 'font-bold': $route.path === '/about' }">
                            About
                        </NuxtLink>
                        <NuxtLink to="/contact" class="router-link primary-color"
                            :class="{ 'font-bold': $route.path === '/contact' }">
                            Contact
                        </NuxtLink>
                    </ul>
                </nav>
            </div>

            <!-- Bouton burger menu visible uniquement sur mobile/tablette -->
            <div class="flex md:hidden items-center space-x-4">
                <button @click="toggleMobileMenu" class="focus:outline-none burger-button">
                    <div class="burger-icon-container">
                        <svg v-show="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 burger-icon"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg v-show="mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 close-icon"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>

        <!-- Menu mobile avec une hauteur fixe qui s'affiche/cache selon l'état avec transition -->
        <div class="md:hidden shadow-lg rounded-lg overflow-hidden mobile-menu-container"
            :style="{ height: mobileMenuOpen ? mobileMenuHeight + 'px' : '0px' }">
            <div ref="mobileMenu" class="py-4  mobile-menu">
                <nav>
                    <ul class="flex flex-col space-y-4 px-4">
                        <NuxtLink @click="mobileMenuOpen = false" to="/" class="router-link block py-2 secondary-color"
                            :class="{ 'font-bold': $route.path === '/' }">
                            Home
                        </NuxtLink>
                        <NuxtLink @click="mobileMenuOpen = false" to="/projects"
                            class="router-link block py-2 secondary-color"
                            :class="{ 'font-bold': $route.path === '/projects' }">
                            Projects
                        </NuxtLink>
                        <NuxtLink @click="mobileMenuOpen = false" to="/about"
                            class="router-link block py-2 secondary-color"
                            :class="{ 'font-bold': $route.path === '/about' }">
                            About
                        </NuxtLink>
                        <NuxtLink @click="mobileMenuOpen = false" to="/contact"
                            class="router-link block py-2 secondary-color"
                            :class="{ 'font-bold': $route.path === '/contact' }">
                            Contact
                        </NuxtLink>
                    </ul>
                </nav>

                <!-- Location and Hour dans le menu mobile -->
                <div class="mt-4 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LiveClock timezone="Europe/Paris" />
                </div>
            </div>
        </div>
    </header>
</template>

<script>
import LiveClock from '~/components/LiveClock.vue'
import { inject } from 'vue'

export default {
    components: {
        LiveClock
    },
    data() {
        return {
            mobileMenuOpen: false,
            mobileMenuHeight: 0
        }
    },
    methods: {
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen

            // Si le menu est ouvert, on calcule sa hauteur pour l'animation
            if (this.mobileMenuOpen) {
                this.$nextTick(() => {
                    this.mobileMenuHeight = this.$refs.mobileMenu.scrollHeight
                })
            }
        }
    },
    watch: {
        // Fermer le menu lorsque la route change
        '$route'() {
            this.mobileMenuOpen = false
        }
    },
    mounted() {
        // Calculer la hauteur du menu mobile pour l'animation
        this.$nextTick(() => {
            if (this.$refs.mobileMenu) {
                this.mobileMenuHeight = this.$refs.mobileMenu.scrollHeight
            }
        })

        // Fermer le menu mobile lorsque l'écran devient plus grand que md
        this.checkScreenSize = () => {
            if (window.innerWidth >= 768 && this.mobileMenuOpen) {
                this.mobileMenuOpen = false
            }

            // Recalculer la hauteur du menu mobile après redimensionnement
            if (this.mobileMenuOpen && this.$refs.mobileMenu) {
                this.mobileMenuHeight = this.$refs.mobileMenu.scrollHeight
            }
        }

        window.addEventListener('resize', this.checkScreenSize)
    },

    beforeUnmount() {
        // Nettoyage de l'event listener (méthode Vue 3)
        window.removeEventListener('resize', this.checkScreenSize)
    }
}
</script>

<style scoped>
.router-link {
    color: var(--current-header-link-color);
    transition: font-weight 0.2s ease, color 0.2s ease;
    padding: 0.5rem;
}

.router-link:hover {
    color: var(--current-secondary-color);
}

/* Animation du bouton burger */
.burger-icon-container {
    position: relative;
    width: 2rem;
    height: 2rem;
}

.burger-icon,
.close-icon {
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.burger-icon {
    opacity: 1;
    transform: rotate(0deg);
}

.close-icon {
    opacity: 1;
    transform: rotate(0deg);
}

/* Animation de transition pour le menu mobile */
.mobile-menu-container {
    transition: height 0.3s ease-in-out;
    margin-top: 4px;
}

/* Ancienne animation (conservée pour référence) */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>