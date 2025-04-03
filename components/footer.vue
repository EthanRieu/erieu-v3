<template>
    <footer>
        <div class="flex flex-row space-x-24 font-semibold">
            <!-- Site Map -->
            <div>
                <div class="secondary-color mb-6">Site map</div>
                <nav>
                    <ul class="flex flex-col space-y-4">
                        <NuxtLink to="/" class="link-color hover-effect cursor-pointer w-fit">Home</NuxtLink>
                        <NuxtLink to="/projects" class="link-color hover-effect cursor-pointer w-fit">Projects
                        </NuxtLink>
                        <NuxtLink to="/about" class="link-color hover-effect cursor-pointer w-fit">About</NuxtLink>
                        <NuxtLink to="/contact" class="link-color hover-effect cursor-pointer w-fit">Contact</NuxtLink>
                    </ul>
                </nav>
            </div>

            <!-- Socials -->
            <div>
                <div class="secondary-color mb-6">Socials</div>
                <div class="space-y-4 flex flex-col">
                    <a href="https://www.linkedin.com/in/ethan-rieu-19431626b/" target="_blank"
                        class="link-color hover-effect cursor-pointer w-fit">
                        LinkedIn
                    </a>
                    <a href="https://www.instagram.com/ethan_rieu/" target="_blank"
                        class="link-color hover-effect cursor-pointer w-fit">
                        Instagram
                    </a>
                    <a href="https://github.com/EthanRieu" target="_blank"
                        class="link-color hover-effect cursor-pointer w-fit">
                        GitHub
                    </a>
                </div>
            </div>
        </div>
        <div class="hidden md:visible md:flex flex-row justify-between items-center mt-8">
            <div class="w-2/5">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 1500 500" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">

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
            <div @click="scrollToTop" class="primary-color smooth-underline font-bold cursor-pointer w-fit">Back on top
                ↑</div>
            <div class="primary-color font-bold">Copyright © ERIEU 2025</div>
        </div>
        <div class="visible md:hidden flex flex-col justify-between items-center mt-8">
            <img src="/assets/img/logo.svg" alt="Logo ERIEU" class="w-2/5" />
            <div class="flex flex-row justify-center space-x-4">
                <div @click="scrollToTop" class="primary-color text-sm smooth-underline font-bold cursor-pointer w-fit">
                    Back on top ↑
                </div>
                <div class="primary-color text-sm font-bold">Copyright © ERIEU 2025</div>
            </div>
        </div>
    </footer>
</template>

<script setup>
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
</script>

<style scoped>
.hover-effect {
    transition: color 0.3s ease-in-out;
}

.hover-effect:hover {
    color: var(--secondary-color);
    transition: color 0.3s ease-in-out;
}
</style>