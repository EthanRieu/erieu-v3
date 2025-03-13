<template>
    <header class="p-4 md:p-6 lg:p-8">
        <div class="flex items-center justify-between">
            <!-- Logo et Location/Hour -->
            <div class="flex items-center space-x-4 md:space-x-8 lg:space-x-16">
                <!-- Logo -->
                <img class="w-28 md:w-32 lg:w-40" src="/assets/img/logo.svg" alt="Logo ERIEU">
                
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
                        <NuxtLink to="/" class="router-link secondary-color" :class="{ 'font-bold': $route.path === '/' }">
                            Home
                        </NuxtLink>
                        <NuxtLink to="/projects" class="router-link secondary-color" :class="{ 'font-bold': $route.path === '/projects' }">
                            Projects
                        </NuxtLink>
                        <NuxtLink to="/about" class="router-link secondary-color" :class="{ 'font-bold': $route.path === '/about' }">
                            About
                        </NuxtLink>
                        <NuxtLink to="/contact" class="router-link secondary-color" :class="{ 'font-bold': $route.path === '/contact' }">
                            Contact
                        </NuxtLink>
                    </ul>
                </nav>

                <!-- Toggle Light/Dark mode -->
                <div>
                    <img class="w-10 lg:w-12 rotate-z-180 rotate-45" src="/assets/img/moon.svg" alt="Moon icon for toggle theme">
                </div>
            </div>

            <!-- Bouton burger menu visible uniquement sur mobile/tablette -->
            <div class="flex md:hidden items-center space-x-4">
                <!-- Toggle Light/Dark mode sur mobile -->
                <div>
                    <img class="w-8 rotate-z-180 rotate-45" src="/assets/img/moon.svg" alt="Moon icon for toggle theme">
                </div>
                
                <!-- Bouton burger -->
                <button @click="toggleMobileMenu" class="focus:outline-none">
                    <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Menu mobile qui s'affiche/cache selon l'état -->
        <div v-if="mobileMenuOpen" class="md:hidden mt-4 py-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <nav>
                <ul class="flex flex-col space-y-4 px-4">
                    <NuxtLink @click="mobileMenuOpen = false" to="/" class="router-link block py-2 secondary-color" :class="{ 'font-bold': $route.path === '/' }">
                        Home
                    </NuxtLink>
                    <NuxtLink @click="mobileMenuOpen = false" to="/projects" class="router-link block py-2 secondary-color" :class="{ 'font-bold': $route.path === '/projects' }">
                        Projects
                    </NuxtLink>
                    <NuxtLink @click="mobileMenuOpen = false" to="/about" class="router-link block py-2 secondary-color" :class="{ 'font-bold': $route.path === '/about' }">
                        About
                    </NuxtLink>
                    <NuxtLink @click="mobileMenuOpen = false" to="/contact" class="router-link block py-2 secondary-color" :class="{ 'font-bold': $route.path === '/contact' }">
                        Contact
                    </NuxtLink>
                </ul>
            </nav>
            
            <!-- Location and Hour dans le menu mobile -->
            <div class="mt-4 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <LiveClock timezone="Europe/Paris" />
            </div>
        </div>
    </header>
</template>

<script>
import LiveClock from '~/components/LiveClock.vue'

export default {
    components: {
        LiveClock
    },
    data() {
        return {
            mobileMenuOpen: false
        }
    },
    methods: {
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen
        }
    },
    watch: {
        // Fermer le menu lorsque la route change
        '$route'() {
            this.mobileMenuOpen = false
        }
    },
    mounted() {
        // Fermer le menu mobile lorsque l'écran devient plus grand que md
        this.checkScreenSize = () => {
            if (window.innerWidth >= 768 && this.mobileMenuOpen) {
                this.mobileMenuOpen = false
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
    transition: font-weight 0.2s ease, color 0.2s ease;
    padding: 0.5rem;
}

.router-link:hover {
    color: #2F4A4F;
}

/* Animation du menu mobile */
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

div[v-if="mobileMenuOpen"] {
    animation: slideDown 0.3s ease-out forwards;
}
</style>