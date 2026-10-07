<template>
    <header class="p-4 md:p-6 lg:p-8" @keydown.escape="closeMobileMenu">
        <div class="flex items-center justify-between">
            <!-- Logo et Location/Hour -->
            <div class="flex items-center space-x-4 md:space-x-8 lg:space-x-16">
                <!-- Logo -->
                <!-- Nom accessible du lien = <title> du SVG (role="img"). Un aria-label sur le lien serait signalé
                     par axe comme incohérent avec le texte visible du SVG (label-content-name-mismatch) -->
                <NuxtLink :to="localePath('/')" class="router-link">
                    <div class="w-28 md:w-32 lg:w-40">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            viewBox="0 0 1500 500" shape-rendering="geometricPrecision"
                            text-rendering="geometricPrecision" focusable="false" role="img"
                            aria-labelledby="header-logo-title">
                            <title id="header-logo-title">{{ $t('meta.siteName') }} — {{ $t('nav.home') }}</title>

                            <!-- ERIEU Text -->
                            <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75"
                                font-weight="800" transform="matrix(5 0 0 5 109.262384 384.859102)"
                                class="header-theme-text" stroke-width="0">
                                <tspan y="0" font-weight="800" stroke-width="0">ERIEU</tspan>
                            </text>

                            <!-- TM Text -->
                            <text dx="0" dy="0" font-family="'Schibsted Grotesk', sans-serif" font-size="75"
                                font-weight="800" transform="translate(1266.074934 142.194716)"
                                class="header-theme-text" stroke-width="0">
                                <tspan y="0" font-weight="800" stroke-width="0">TM</tspan>
                            </text>
                        </svg>
                    </div>
                </NuxtLink>

                <!-- Location and Hour - caché sur mobile -->
                <div class="hidden md:block">
                    <LiveClock timezone="Europe/Paris" />
                </div>
            </div>

            <!-- Navigation desktop -->
            <div class="hidden md:flex items-center space-x-8 lg:space-x-12">
                <nav :aria-label="$t('nav.mainNavigation')">
                    <ul class="flex flex-row space-x-2 text-lg lg:text-xl font-medium">
                        <li v-for="item in navItems" :key="item.path">
                            <NuxtLink :to="localePath(item.path)" class="router-link primary-color"
                                :class="{ 'font-bold': isActive(item.path) }"
                                :aria-current="isActive(item.path) ? 'page' : undefined">
                                {{ $t(item.label) }}
                            </NuxtLink>
                        </li>
                    </ul>
                </nav>

                <!-- Sélecteur de langue -->
                <nav :aria-label="$t('nav.language')">
                    <ul class="flex flex-row items-center text-sm lg:text-base font-medium">
                        <li v-for="(item, index) in locales" :key="item.code" class="flex items-center">
                            <span v-if="index > 0" class="link-color" aria-hidden="true">/</span>
                            <NuxtLink :to="switchLocalePath(item.code)" :hreflang="item.code"
                                class="router-link primary-color uppercase"
                                :class="{ 'font-bold': item.code === locale }"
                                :aria-current="item.code === locale ? 'true' : undefined"
                                :aria-label="$t('nav.switchTo', { lang: $t('nav.languages.' + item.code) })">
                                {{ item.code }}
                            </NuxtLink>
                        </li>
                    </ul>
                </nav>
            </div>

            <!-- Bouton burger menu visible uniquement sur mobile/tablette -->
            <div class="flex md:hidden items-center space-x-4">
                <button type="button" @click="toggleMobileMenu" class="burger-button"
                    :aria-expanded="mobileMenuOpen" aria-controls="mobile-menu"
                    :aria-label="mobileMenuOpen ? $t('nav.closeMenu') : $t('nav.openMenu')">
                    <div class="burger-icon-container">
                        <svg v-show="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 burger-icon"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <svg v-show="mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 close-icon"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>

        <!-- Menu mobile : hauteur animée, retiré de l'ordre de tabulation quand il est fermé (inert) -->
        <div id="mobile-menu" class="md:hidden shadow-lg rounded-lg overflow-hidden mobile-menu-container"
            :style="{ height: mobileMenuOpen ? mobileMenuHeight + 'px' : '0px' }" :inert="!mobileMenuOpen">
            <div ref="mobileMenu" class="py-4 mobile-menu">
                <nav :aria-label="$t('nav.mainNavigation')">
                    <ul class="flex flex-col space-y-4 px-4">
                        <li v-for="item in navItems" :key="item.path">
                            <NuxtLink @click="closeMobileMenu" :to="localePath(item.path)"
                                class="router-link block py-2 secondary-color"
                                :class="{ 'font-bold': isActive(item.path) }"
                                :aria-current="isActive(item.path) ? 'page' : undefined">
                                {{ $t(item.label) }}
                            </NuxtLink>
                        </li>
                    </ul>
                </nav>

                <!-- Location and Hour + langue dans le menu mobile -->
                <div class="mt-4 px-4 pt-4 border-t border-gray-200 flex items-center justify-between space-x-4">
                    <LiveClock timezone="Europe/Paris" />
                    <nav :aria-label="$t('nav.language')">
                        <ul class="flex flex-row items-center text-base font-medium">
                            <li v-for="(item, index) in locales" :key="item.code" class="flex items-center">
                                <span v-if="index > 0" class="link-color" aria-hidden="true">/</span>
                                <NuxtLink @click="closeMobileMenu" :to="switchLocalePath(item.code)"
                                    :hreflang="item.code" class="router-link secondary-color uppercase"
                                    :class="{ 'font-bold': item.code === locale }"
                                    :aria-current="item.code === locale ? 'true' : undefined"
                                    :aria-label="$t('nav.switchTo', { lang: $t('nav.languages.' + item.code) })">
                                    {{ item.code }}
                                </NuxtLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const route = useRoute()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const { locale, locales } = useI18n()

const navItems = [
    { path: '/', label: 'nav.home' },
    { path: '/projects', label: 'nav.projects' },
    { path: '/about', label: 'nav.about' },
    { path: '/contact', label: 'nav.contact' }
]

// Compare avec le chemin localisé ("/fr/about" pour la locale fr) et non le chemin brut
const isActive = (path) => route.path === localePath(path)

const mobileMenuOpen = ref(false)
const mobileMenuHeight = ref(0)
const mobileMenu = ref(null)

const measureMenu = () => {
    if (mobileMenu.value) {
        mobileMenuHeight.value = mobileMenu.value.scrollHeight
    }
}

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
    if (mobileMenuOpen.value) {
        nextTick(measureMenu)
    }
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
}

// Fermer le menu lorsque la route change
watch(() => route.fullPath, closeMobileMenu)

const checkScreenSize = () => {
    if (window.innerWidth >= 768 && mobileMenuOpen.value) {
        mobileMenuOpen.value = false
    }
    if (mobileMenuOpen.value) {
        measureMenu()
    }
}

onMounted(() => {
    nextTick(measureMenu)
    window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.router-link {
    color: var(--header-link-color);
    transition: font-weight 0.2s ease, color 0.2s ease;
    padding: 0.5rem;
}

.router-link:hover {
    color: var(--link-color);
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

/* Animation de transition pour le menu mobile */
.mobile-menu-container {
    transition: height 0.3s ease-in-out;
    margin-top: 4px;
}

@media (prefers-reduced-motion: reduce) {
    .mobile-menu-container,
    .router-link,
    .burger-icon,
    .close-icon {
        transition-duration: 0.01ms;
    }
}
</style>
