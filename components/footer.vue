<template>
    <!-- Même grille que le contenu (site-container) : le footer est placé hors des conteneurs de page -->
    <footer class="site-container pb-16">
        <div class="flex flex-row space-x-24 font-semibold">
            <!-- Site Map -->
            <nav :aria-label="$t('footer.sitemap')">
                <div class="secondary-color mb-6">{{ $t('footer.sitemap') }}</div>
                <ul class="flex flex-col space-y-4">
                    <li v-for="item in navItems" :key="item.path">
                        <NuxtLink :to="localePath(item.path)" class="link-color hover-effect w-fit block">
                            {{ $t(item.label) }}
                        </NuxtLink>
                    </li>
                </ul>
            </nav>

            <!-- Socials -->
            <div>
                <div class="secondary-color mb-6">{{ $t('footer.socials') }}</div>
                <ul class="space-y-4 flex flex-col">
                    <li v-for="social in socials" :key="social.name">
                        <a :href="social.href" target="_blank" rel="noopener noreferrer"
                            class="link-color hover-effect w-fit block">
                            {{ social.name }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="hidden md:flex flex-row justify-between items-center mt-8">
            <div class="w-2/5">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 1500 500" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"
                    role="img" :aria-label="$t('footer.logoAlt')">

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
            <button type="button" @click="scrollToTop"
                class="primary-color smooth-underline font-bold cursor-pointer w-fit">
                {{ $t('footer.backToTop') }}
            </button>
            <div class="primary-color font-bold">{{ $t('footer.copyright', { year }) }}</div>
        </div>

        <div class="md:hidden flex flex-col justify-between items-center mt-8">
            <img src="~/assets/img/logo.svg" :alt="$t('footer.logoAlt')" class="w-2/5" width="1500" height="500"
                loading="lazy" decoding="async" />
            <div class="flex flex-row justify-center space-x-4">
                <button type="button" @click="scrollToTop"
                    class="primary-color text-sm smooth-underline font-bold cursor-pointer w-fit">
                    {{ $t('footer.backToTop') }}
                </button>
                <div class="primary-color text-sm font-bold">{{ $t('footer.copyright', { year }) }}</div>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { prefersReducedMotion } from '~/composables/useRevealAnimations'

const localePath = useLocalePath()

const navItems = [
    { path: '/', label: 'nav.home' },
    { path: '/projects', label: 'nav.projects' },
    { path: '/about', label: 'nav.about' },
    { path: '/contact', label: 'nav.contact' }
]

const socials = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/ethan-rieu-19431626b/' },
    { name: 'Instagram', href: 'https://www.instagram.com/ethan_rieu/' },
    { name: 'GitHub', href: 'https://github.com/EthanRieu' }
]

const year = new Date().getFullYear()

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    })
}
</script>

<style scoped>
.hover-effect {
    transition: color 0.3s ease-in-out;
}

.hover-effect:hover {
    color: var(--secondary-color);
}
</style>
